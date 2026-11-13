import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { MongoClient } from "mongodb";
import { POST } from "../../app/api/progress/route";
import { GET as adminGet } from "../../app/api/admin/route";
import { eligibleStudent } from "../exam/service";
import { courses } from "./identity";

test(
  "real MongoDB: save/reload, course/student isolation, stale writes and concurrent first saves",
  { skip: !process.env.MONGODB_TEST_BINARY },
  async () => {
    const server = createServer();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const port = (server.address() as { port: number }).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const directory = await mkdtemp(join(tmpdir(), "kodlab-mongo-test-"));
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
    const uri = `mongodb://127.0.0.1:${port}`;
    const previous = process.env.MONGODB_URI;
    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = "kodlab_test";
    const probe = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    const send = async (body: Record<string, unknown>) => {
      const response = await POST(
        new Request("http://localhost/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      return { status: response.status, data: await response.json() };
    };
    const call = (
      action: string,
      studentId = "001",
      course = "python",
      revision = 0,
      progress = {},
    ) => send({ action, studentId, course, revision, progress });
    const resolveTeacher = (name: string) =>
      send({ action: "resolve-teacher", name });
    try {
      await probe.connect();
      const db = probe.db("kodlab_test");
      await db.collection("student_profiles").insertMany(
        ["001", "002", "003"].map((id) => ({
          _id: id as never,
          sourceId: "source-" + id,
        })),
      );
      for (const id of ["1", "12", "UNKNOWN"])
        for (const course of courses) {
          assert.equal((await call("load", id, course)).status, 403);
          assert.equal((await call("save", id, course)).status, 403);
        }
      assert.equal(await db.collection("student_progress").countDocuments(), 0);
      assert.equal((await call("load")).data.progress, null);
      const progress = {
        completed: ["exercise-1"],
        drafts: { "exercise-1": { code: "print(42)" } },
        quizAttempts: { all: { answers: { q1: 2 } } },
      };
      assert.equal(
        (await call("save", "001", "python", 0, progress)).status,
        200,
      );
      assert.deepEqual((await call("load")).data.progress, progress);
      assert.equal((await call("load", "002")).data.progress, null);
      assert.equal(
        (await call("load", "001", "javascript")).data.progress,
        null,
      );
      assert.equal((await call("save", "001", "python", 0, {})).status, 409);
      assert.equal(
        (await call("save", "001", "python", 1, { completed: [] })).status,
        200,
      );
      assert.equal(
        (await call("save", "001", "python", 1, progress)).status,
        409,
      );
      const race = await Promise.all([
        call("save", "003"),
        call("save", "003"),
      ]);
      assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
      await db
        .collection("student_profiles")
        .updateOne(
          { _id: "001" as never },
          { $set: { deletedAt: new Date() } },
        );
      assert.equal((await call("load")).status, 403);
      assert.equal((await call("save", "001", "python", 2)).status, 403);
      assert.equal(
        await db
          .collection("student_progress")
          .countDocuments({ studentId: "001" }),
        1,
      );

      const accounts = db.collection<{
        _id: string;
        name: string;
        active: boolean;
      }>("admin_accounts");
      await accounts.insertMany([
        { _id: "orgilsaikhan.ch", name: "Туршилтын Багш", active: true },
        { _id: "batzorig.b", name: "Өөр Багш", active: true },
        { _id: "inactive.teacher", name: "Идэвхгүй Багш", active: false },
      ]);
      const teacher = await resolveTeacher("  ТУРШИЛТЫН   багш  ");
      assert.deepEqual(teacher, {
        status: 200,
        data: { id: "ORGILSAIKHAN.CH" },
      });
      assert.equal((await resolveTeacher("Бүртгэлгүй Багш")).status, 403);
      assert.equal((await resolveTeacher("Идэвхгүй Багш")).status, 403);
      for (const course of courses) {
        for (const id of ["unknown.teacher", "inactive.teacher"])
          for (const action of ["load", "save"])
            assert.equal((await call(action, id, course)).status, 403);

        assert.equal(
          (await call("load", "orgilsaikhan.ch", course)).data.progress,
          null,
        );
        const practice = { drafts: { example: { code: `teacher ${course}` } } };
        assert.equal(
          (await call("save", " Orgilsaikhan.ch ", course, 0, practice)).status,
          200,
        );
        assert.deepEqual(
          (await call("load", teacher.data.id, course)).data.progress,
          practice,
        );
        assert.equal(
          (await call("load", "batzorig.b", course)).data.progress,
          null,
        );
        assert.equal((await call("load", "002", course)).data.progress, null);
      }
      assert.equal(await db.collection("student_profiles").countDocuments(), 3);
      assert.equal(await db.collection("admin_sessions").countDocuments(), 0);
      assert.equal(
        (await adminGet(new Request("http://localhost/api/admin"))).status,
        401,
      );
      await assert.rejects(() => eligibleStudent("ORGILSAIKHAN.CH"));

      await accounts.updateOne(
        { _id: "batzorig.b" },
        { $set: { name: "Туршилтын Багш" } },
      );
      assert.equal((await resolveTeacher("Туршилтын Багш")).status, 403);
      assert.equal((await call("load", "batzorig.b")).status, 200);
      await accounts.updateOne(
        { _id: "orgilsaikhan.ch" },
        { $set: { active: false } },
      );
      assert.deepEqual(await resolveTeacher("Туршилтын Багш"), {
        status: 200,
        data: { id: "BATZORIG.B" },
      });
      for (const action of ["load", "save"])
        assert.equal(
          (await call(action, "orgilsaikhan.ch", "python", 1)).status,
          403,
        );
      assert.equal(
        await db
          .collection("student_progress")
          .countDocuments({ studentId: "ORGILSAIKHAN.CH" }),
        courses.length,
      );
    } finally {
      await probe.close();
      const globalPool = globalThis as typeof globalThis & {
        classroomMongo?: Promise<MongoClient>;
      };
      await (await globalPool.classroomMongo)?.close();
      delete globalPool.classroomMongo;
      if (previous === undefined) delete process.env.MONGODB_URI;
      else process.env.MONGODB_URI = previous;
      const stopped = new Promise((resolve) => proc.once("exit", resolve));
      proc.kill("SIGTERM");
      await stopped;
      await rm(directory, { recursive: true, force: true });
    }
  },
);
