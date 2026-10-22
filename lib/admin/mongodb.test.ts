import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { MongoClient } from "mongodb";
import {
  hashPassword,
  isAdmin,
  ADMIN_COOKIE,
  authenticateAdmin,
  getAdminIdentity,
} from "./auth";
import { applyLmsImport, parseLmsImport } from "./lms-import";
import { schoolFixture } from "./test-fixtures";
import { backfillSummaries } from "./data";
import { catalog } from "./progress";
import { GET, POST } from "../../app/api/admin/route";
import {
  POST as login,
  DELETE as logout,
} from "../../app/api/admin/session/route";
import { GET as studentDetail } from "../../app/api/admin/student/route";
import { POST as progress } from "../../app/api/progress/route";

test(
  "real MongoDB admin: private roster, sessions, grouping, metadata isolation, backfill and login limits",
  { skip: !process.env.MONGODB_TEST_BINARY },
  async () => {
    const server = createServer();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const port = (server.address() as { port: number }).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const directory = await mkdtemp(join(tmpdir(), "kodlab-admin-test-"));
    const proc = spawn(
      process.env.MONGODB_TEST_BINARY!,
      [
        "--dbpath",
        directory,
        "--port",
        String(port),
        "--bind_ip",
        "127.0.0.1",
        "--quiet",
      ],
      { stdio: "ignore" },
    );
    const uri = `mongodb://127.0.0.1:${port}`,
      previous = {
        uri: process.env.MONGODB_URI,
        db: process.env.MONGODB_DB,
        key: process.env.ADMIN_RATE_LIMIT_KEY,
      };
    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = "admin_test";
    process.env.ADMIN_RATE_LIMIT_KEY = "integration-key";
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    const request = (path: string, body?: unknown, cookie = "") =>
      new Request(`https://example.test${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://example.test",
          Cookie: cookie,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    try {
      await client.connect();
      const db = client.db("admin_test");
      await db.collection("admin_accounts").insertOne({
        _id: "teacher" as never,
        name: "Teacher",
        email: "teacher@oyunlag.edu.mn",
        active: true,
        passwordHash: await hashPassword("admin integration test password"),
      });
      const signedIn = await login(
        request("/api/admin/session", {
          username: "teacher",
          password: "admin integration test password",
        }),
      );
      assert.equal(signedIn.status, 200);
      const setCookie = signedIn.headers.get("set-cookie")!;
      assert.match(setCookie, /HttpOnly/i);
      assert.match(setCookie, /Secure/i);
      assert.match(setCookie, /SameSite=strict/i);
      const cookie = setCookie.split(";")[0],
        token = cookie.slice(ADMIN_COOKIE.length + 1);
      assert.equal(await isAdmin(token), true);
      assert.notEqual(
        (await db.collection("admin_sessions").findOne({}))?._id,
        token,
      );
      await db.collection("student_profiles").insertMany(
        ["001", "002"].map((id) => ({
          _id: id as never,
          name: id,
          notes: "",
          groupId: null,
          sourceId: id === "001" ? "s1" : "s2-test",
          teacherIds: ["teacher"],
        })),
      );
      const first = catalog.python[0].id;
      const snapshot = {
        version: 1,
        active: first,
        completed: [first],
        drafts: {
          [first]: {
            code: 'print("PRIVATE-STUDENT-CODE")',
            inputs: "",
            solutionViewed: false,
          },
        },
      };
      await progress(
        request("/api/progress", {
          action: "save",
          course: "python",
          studentId: "001",
          revision: 0,
          progress: snapshot,
        }),
      );
      await db.collection("student_progress").insertOne({
        _id: "javascript:002" as never,
        studentId: "002",
        course: "javascript",
        revision: 1,
        updatedAt: new Date(),
        progressJson: JSON.stringify({
          completed: [catalog.javascript[0].id],
        }),
      });
      assert.equal(await backfillSummaries(), 1);
      const overview = await GET(request("/api/admin", undefined, cookie));
      assert.equal(overview.status, 200);
      assert.match(overview.headers.get("cache-control")!, /no-store/);
      const raw = await overview.text();
      assert.ok(!raw.includes("PRIVATE-STUDENT-CODE"));
      const roster = JSON.parse(raw);
      assert.equal(roster.students.length, 2);
      assert.equal(roster.students[0].courses.python.completed, 1);
      assert.equal(roster.students[1].courses.javascript.completed, 1);
      assert.equal(
        (
          await POST(
            request("/api/admin", { action: "group", name: "10A" }, cookie),
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await POST(
            request("/api/admin", { action: "group", name: "10a" }, cookie),
          )
        ).status,
        409,
      );
      const group = (await db
        .collection("student_groups")
        .findOne({}))!._id.toString();
      await db.collection("student_profiles").insertOne({
        _id: "003" as never,
        name: "003",
        notes: "",
        groupId: null,
        sourceId: "s3-test",
        teacherIds: ["teacher"],
      });
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              {
                action: "assign",
                studentIds: ["001", "002", "003"],
                groupId: group,
              },
              cookie,
            ),
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              {
                action: "profile",
                studentId: "001",
                name: "Сурагч",
                notes: "PRIVATE-TEACHER-NOTE",
                groupId: group,
              },
              cookie,
            ),
          )
        ).status,
        200,
      );
      const updated = await (
        await GET(request("/api/admin", undefined, cookie))
      ).json();
      assert.equal(updated.students.length, 3);
      assert.ok(
        updated.students.every((s: { groupId: string }) => s.groupId === group),
      );
      const detail = await studentDetail(
        request(
          `/api/admin/student?studentId=001&course=python&exerciseId=${first}`,
          undefined,
          cookie,
        ),
      );
      assert.equal(
        (await detail.json()).selected.files["exercise.py"],
        'print("PRIVATE-STUDENT-CODE")',
      );
      const learner = await progress(
        request("/api/progress", {
          action: "load",
          course: "python",
          studentId: "001",
        }),
      );
      const learnerText = await learner.text();
      assert.ok(!learnerText.includes("PRIVATE-TEACHER-NOTE"));
      assert.deepEqual(JSON.parse(learnerText).progress, snapshot);
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "assign", studentIds: ["004"], groupId: "missing" },
              cookie,
            ),
          )
        ).status,
        400,
      );
      assert.equal(
        await db
          .collection("student_profiles")
          .countDocuments({ _id: "004" as never }),
        0,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "assign", studentIds: [{ $ne: null }], groupId: group },
              cookie,
            ),
          )
        ).status,
        400,
      );
      assert.equal((await GET(request("/api/admin"))).status, 401);
      await db
        .collection("admin_sessions")
        .updateMany({}, { $set: { expiresAt: new Date(0) } });
      assert.equal(await isAdmin(token), false);
      const fresh = await login(
        request("/api/admin/session", {
          username: "teacher",
          password: "admin integration test password",
        }),
      );
      const freshCookie = fresh.headers.get("set-cookie")!.split(";")[0];
      assert.equal(
        (
          await logout(
            new Request("https://example.test/api/admin/session", {
              method: "DELETE",
              headers: { Origin: "https://example.test", Cookie: freshCookie },
            }),
          )
        ).status,
        200,
      );
      assert.equal(
        (await GET(request("/api/admin", undefined, freshCookie))).status,
        401,
      );
      const rotated = await login(
        request("/api/admin/session", {
          username: "teacher",
          password: "admin integration test password",
        }),
      );
      const rotatedToken = rotated.headers
        .get("set-cookie")!
        .split(";")[0]
        .slice(ADMIN_COOKIE.length + 1);
      await db
        .collection("admin_accounts")
        .updateOne(
          { _id: "teacher" as never },
          { $set: { passwordHash: await hashPassword("rotated password") } },
        );
      assert.equal(await isAdmin(rotatedToken), false);
      await db.collection("admin_login_attempts").deleteMany({});
      const attempts = await Promise.all(
        Array.from({ length: 12 }, () =>
          login(request("/api/admin/session", { password: "wrong" })),
        ),
      );
      assert.equal(
        attempts.filter((response) => response.status === 401).length,
        10,
      );
      assert.equal(
        attempts.filter((response) => response.status === 429).length,
        2,
      );
      const plan = parseLmsImport(schoolFixture());
      plan.students.push({
        id: "005",
        sourceId: "s5",
        name: "Beta only",
        classSourceId: "c1",
        teacherIds: ["beta"],
      });
      const beforeProgress = await db
        .collection("student_progress")
        .findOne({ studentId: "001" });
      await applyLmsImport(plan);
      const alpha = await authenticateAdmin("alpha", "alpha@oyunlag.edu.mn");
      assert.ok(alpha);
      assert.ok(
        await authenticateAdmin("beta@oyunlag.edu.mn", "beta@oyunlag.edu.mn"),
      );
      assert.ok(await authenticateAdmin("gamma", "gamma@oyunlag.edu.mn"));
      assert.equal(
        await authenticateAdmin("alpha", "beta@oyunlag.edu.mn"),
        null,
      );
      assert.equal(
        await authenticateAdmin("unknown", "alpha@oyunlag.edu.mn"),
        null,
      );
      const hashBefore = alpha.passwordHash;
      await applyLmsImport(plan);
      assert.equal(
        (await authenticateAdmin("alpha", "alpha@oyunlag.edu.mn"))
          ?.passwordHash,
        hashBefore,
      );
      assert.equal(
        (
          await db
            .collection("student_profiles")
            .findOne({ _id: "001" as never })
        )?.notes,
        "PRIVATE-TEACHER-NOTE",
      );
      assert.deepEqual(
        await db.collection("student_progress").findOne({ studentId: "001" }),
        beforeProgress,
      );
      assert.equal(
        await db
          .collection("student_groups")
          .countDocuments({ sourceId: { $exists: true } }),
        2,
      );
      assert.equal(
        (
          await db
            .collection("student_profiles")
            .findOne({ _id: "001" as never })
        )?.teacherIds.length,
        2,
      );
      const accountDoc = await db
        .collection("admin_accounts")
        .findOne({ _id: "alpha" as never });
      assert.ok(accountDoc);
      assert.ok(!("gender" in accountDoc));
      const { createAdminSession } = await import("./auth");
      const alphaToken = await createAdminSession(alpha);
      const beta = await authenticateAdmin("beta", "beta@oyunlag.edu.mn");
      assert.ok(beta);
      const betaToken = await createAdminSession(beta);
      assert.equal((await getAdminIdentity(alphaToken))?.id, "alpha");
      assert.equal((await getAdminIdentity(betaToken))?.id, "beta");
      const alphaCookie = `kodlab-admin=${alphaToken}`;
      const gamma = await authenticateAdmin("gamma", "gamma@oyunlag.edu.mn");
      assert.ok(gamma);
      const gammaCookie = `kodlab-admin=${await createAdminSession(gamma)}`;
      const scoped = await (
        await GET(request("/api/admin", undefined, alphaCookie))
      ).json();
      assert.deepEqual(
        scoped.students.map((s: { id: string }) => s.id),
        ["001"],
      );
      assert.deepEqual(
        scoped.groups.map((g: { name: string }) => g.name),
        ["7A"],
      );
      assert.deepEqual(
        scoped.teachers.map((t: { id: string }) => t.id),
        ["alpha"],
      );
      assert.equal(
        (
          await studentDetail(
            request(
              "/api/admin/student?studentId=004&course=python",
              undefined,
              alphaCookie,
            ),
          )
        ).status,
        403,
      );
      for (const action of ["profile", "assign", "delete"]) {
        assert.equal(
          (
            await POST(
              request(
                "/api/admin",
                {
                  action,
                  studentId: "004",
                  studentIds: ["004"],
                  groupId: null,
                  name: "forbidden",
                  notes: "",
                },
                alphaCookie,
              ),
            )
          ).status,
          403,
        );
      }
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "assign", studentIds: ["1"], groupId: null },
              alphaCookie,
            ),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "group", id: scoped.groups[0].id, name: "changed" },
              gammaCookie,
            ),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "delete", studentId: "001" },
              alphaCookie,
            ),
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await (
            await GET(request("/api/admin", undefined, alphaCookie))
          ).json()
        ).students.length,
        0,
      );
      assert.deepEqual(
        await db.collection("student_progress").findOne({ studentId: "001" }),
        beforeProgress,
      );
      assert.equal(
        (
          await progress(
            request("/api/progress", {
              action: "load",
              course: "python",
              studentId: "001",
            }),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "restore", studentId: "001" },
              gammaCookie,
            ),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await POST(
            request(
              "/api/admin",
              { action: "restore", studentId: "001" },
              alphaCookie,
            ),
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await progress(
            request("/api/progress", {
              action: "load",
              course: "python",
              studentId: "001",
            }),
          )
        ).status,
        200,
      );
      await db
        .collection("admin_accounts")
        .updateOne({ _id: "alpha" as never }, { $set: { active: false } });
      assert.equal(await isAdmin(alphaToken), false);
      assert.equal(await isAdmin(betaToken), true);
      const publicRoster = await (
        await GET(request("/api/admin", undefined, `kodlab-admin=${betaToken}`))
      ).text();
      assert.deepEqual(
        JSON.parse(publicRoster).students.map((s: { id: string }) => s.id),
        ["001", "005"],
      );
      assert.ok(!publicRoster.includes("passwordHash"));
      assert.ok(!publicRoster.includes(hashBefore));
      const betaCookie = `kodlab-admin=${betaToken}`;
      const add = {
        action: "create-student",
        studentId: " 20s0999 ",
        name: " М.Шинэ сурагч ",
        groupId: "test-shared-class",
      };
      await db.collection("student_groups").insertOne({
        _id: "test-shared-class" as never,
        name: "7Г",
        key: "test-shared-class",
        grade: 7,
        teacherIds: ["beta", "gamma"],
        createdAt: new Date(),
      });
      assert.equal((await POST(request("/api/admin", add))).status, 401);
      assert.equal(
        (
          await POST(
            new Request("https://example.test/api/admin", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Origin: "https://attacker.test",
                Cookie: betaCookie,
              },
              body: JSON.stringify(add),
            }),
          )
        ).status,
        403,
      );
      for (const patch of [
        { studentId: "1" },
        { studentId: "12" },
        { studentId: "20С0999" },
        { studentId: { $ne: null } },
        { name: "   " },
        { name: "x".repeat(81) },
      ])
        assert.equal(
          (await POST(request("/api/admin", { ...add, ...patch }, betaCookie)))
            .status,
          400,
        );
      for (const groupId of ["missing", "lms-c2", ""])
        assert.equal(
          (await POST(request("/api/admin", { ...add, groupId }, betaCookie)))
            .status,
          403,
        );
      assert.equal(
        await db
          .collection("student_profiles")
          .countDocuments({ _id: "20S0999" as never }),
        0,
      );
      const creationResponses = await Promise.all(
        [1, 2].map(() =>
          POST(
            request(
              "/api/admin",
              { ...add, teacherIds: ["gamma"] },
              betaCookie,
            ),
          ),
        ),
      );
      assert(
        creationResponses.every((r) => r.status === 200),
        "Identical concurrent retries are idempotent",
      );
      const added = await db
        .collection("student_profiles")
        .findOne({ _id: "20S0999" as never });
      assert(added);
      assert.equal(added.name, "М.Шинэ сурагч");
      assert.deepEqual(added.teacherIds, ["beta"]);
      assert.equal(added.sourceId, "manual:20S0999");
      assert.equal(added.manualEnrollment, true);
      assert.equal(added.groupId, "test-shared-class");
      const addedRows = (
        await (await GET(request("/api/admin", undefined, betaCookie))).json()
      ).students;
      assert(addedRows.some((row: { id: string }) => row.id === "20S0999"));
      const otherRows = (
        await (await GET(request("/api/admin", undefined, gammaCookie))).json()
      ).students;
      assert(!otherRows.some((row: { id: string }) => row.id === "20S0999"));
      assert.equal(
        (
          await progress(
            request("/api/progress", {
              action: "load",
              studentId: "20s0999",
              course: "javascript",
            }),
          )
        ).status,
        200,
      );
      const { eligibleStudent } = await import("../exam/service");
      assert.equal((await eligibleStudent("20S0999")).group.grade, 7);
      await db
        .collection("student_progress")
        .insertOne({
          _id: "javascript:20S0999" as never,
          studentId: "20S0999",
          progressJson: '{"drafts":{"name":"saved work"}}',
          revision: 4,
        });
      await db
        .collection("exam_attempts")
        .insertOne({
          _id: "test:20S0999" as never,
          studentId: "20S0999",
          answers: { choices: { q01: 2 } },
        });
      const workBefore = await db
        .collection("student_progress")
        .findOne({ studentId: "20S0999" });
      const examBefore = await db
        .collection("exam_attempts")
        .findOne({ studentId: "20S0999" });
      assert.equal(
        (await POST(request("/api/admin", add, betaCookie))).status,
        200,
      );
      assert.equal(
        (
          await POST(
            request("/api/admin", { ...add, name: "Overwrite" }, betaCookie),
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await POST(
            request("/api/admin", { ...add, groupId: "lms-c1" }, betaCookie),
          )
        ).status,
        409,
      );
      assert.equal(
        (await POST(request("/api/admin", add, gammaCookie))).status,
        409,
        "Sharing a class does not permit claiming another teacher's student",
      );
      assert.deepEqual(
        await db
          .collection("student_profiles")
          .findOne({ _id: "20S0999" as never }),
        added,
      );
      assert.deepEqual(
        await db
          .collection("student_progress")
          .findOne({ studentId: "20S0999" }),
        workBefore,
      );
      assert.deepEqual(
        await db.collection("exam_attempts").findOne({ studentId: "20S0999" }),
        examBefore,
      );
      await db
        .collection("student_profiles")
        .updateOne(
          { _id: "20S0999" as never },
          { $set: { deletedAt: new Date(), deletedBy: "beta" } },
        );
      assert.equal(
        (await POST(request("/api/admin", add, betaCookie))).status,
        409,
        "Adding cannot silently restore a deleted student",
      );
    } finally {
      await client.close();
      const pool = globalThis as typeof globalThis & {
        classroomMongo?: Promise<MongoClient>;
      };
      await (await pool.classroomMongo)?.close();
      delete pool.classroomMongo;
      for (const [key, value] of Object.entries({
        MONGODB_URI: previous.uri,
        MONGODB_DB: previous.db,
        ADMIN_RATE_LIMIT_KEY: previous.key,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      const stopped = new Promise((resolve) => proc.once("exit", resolve));
      proc.kill("SIGTERM");
      await stopped;
      await rm(directory, { recursive: true, force: true });
    }
  },
);
