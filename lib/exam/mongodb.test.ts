import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type AddressInfo } from "node:net";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";
import { EXAM_ID, examExercises, examQuestions } from "./content";
import { gradeExam } from "./grading";
import { POST as examPost } from "../../app/api/exam/route";
import {
  startAttempt,
  issueExamCode,
  examView,
  currentAttempt,
  saveAttempt,
  teacherExamRows,
  teacherExamDetail,
  recordDeparture,
  resetStudentExam,
  resetClassExam,
  finishAttempt,
  endExamSession,
} from "./service";
import { examCollections } from "./collections";
import { examAnswerBackups } from "./recovery";
import {
  cookieAttempt,
  EXAM_COOKIE,
  studentExamActive,
  tokenHash,
} from "./access";
import { hashPassword, createAdminSession, ADMIN_COOKIE } from "../admin/auth";
import { accountCollection } from "../admin/accounts";
import { classroomDatabase } from "../student/database";
import { proxy } from "../../proxy";
import { POST as progress } from "../../app/api/progress/route";
import { POST as adminExamReset } from "../../app/api/admin/exam/route";

test(
  "MongoDB exam persists, locks lesson pages and progress, enforces deadline, one attempt and teacher scope",
  { skip: !process.env.MONGODB_TEST_BINARY },
  async () => {
    const server = createServer();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test port");
    const port = (address satisfies AddressInfo).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const dir = await mkdtemp(join(tmpdir(), "kodlab-exam-test-"));
    const binary = process.env.MONGODB_TEST_BINARY;
    if (!binary) throw new Error("Missing MongoDB test binary");
    const proc = spawn(
      binary,
      [
        "--dbpath",
        dir,
        "--port",
        String(port),
        "--bind_ip",
        "127.0.0.1",
        "--quiet",
      ],
      { stdio: "ignore" },
    );
    process.env.MONGODB_URI = `mongodb://127.0.0.1:${port}`;
    process.env.MONGODB_DB = "exam_test";
    try {
      const db = await classroomDatabase();
      const account = {
        _id: "teacher2",
        name: "Teacher Two",
        email: "teacher2@example.test",
        active: true,
        passwordHash: await hashPassword("test-only-password"),
      };
      await (await accountCollection()).insertOne(account);
      const adminToken = await createAdminSession(account);
      const profiles = db.collection<{
        _id: string;
        sourceId: string;
        name: string;
        groupId: string;
        teacherIds: string[];
        deletedAt?: Date;
      }>("student_profiles");
      await profiles.insertMany([
        {
          _id: "STUDENT8",
          sourceId: "source1",
          name: "Student One",
          groupId: "8A",
          teacherIds: ["teacher1"],
        },
        {
          _id: "STUDENT7",
          sourceId: "source2",
          name: "Student Two",
          groupId: "7A",
          teacherIds: ["teacher1"],
        },
        {
          _id: "OTHER8",
          sourceId: "source3",
          name: "Other Student",
          groupId: "8A",
          teacherIds: ["teacher2"],
        },
      ]);
      await db
        .collection<{
          _id: string;
          name: string;
          grade: number;
          teacherIds: string[];
        }>("student_groups")
        .insertMany([
          {
            _id: "8A",
            name: "8А",
            grade: 8,
            teacherIds: ["teacher1", "teacher2"],
          },
          { _id: "7A", name: "7А", grade: 7, teacherIds: ["teacher1"] },
        ]);
      async function admitted(id: string, token?: string) {
        const profile = await profiles.findOne({ _id: id });
        assert(profile);
        return startAttempt(
          id,
          token,
          await issueExamCode(id, profile.teacherIds[0]),
          "0".repeat(32),
        );
      }
      await assert.rejects(() => startAttempt("1"));
      await assert.rejects(() => startAttempt("STUDENT8"));
      await assert.rejects(() => issueExamCode("STUDENT8", "teacher2"));
      const staleCode = await issueExamCode("STUDENT8", "teacher1");
      await (
        await examCollections()
      ).sessions.updateOne(
        { attemptId: `${EXAM_ID}:STUDENT8` },
        { $set: { redeemUntil: new Date(0) } },
      );
      await assert.rejects(() =>
        startAttempt("STUDENT8", undefined, staleCode, "a".repeat(32)),
      );
      const code = await issueExamCode("STUDENT8", "teacher1");
      const started = await startAttempt(
        "STUDENT8",
        undefined,
        code,
        "a".repeat(32),
      );
      assert.equal(
        (await startAttempt("STUDENT8", undefined, code, "a".repeat(32))).token,
        started.token,
      );
      await assert.rejects(() =>
        startAttempt("STUDENT8", undefined, code, "b".repeat(32)),
      );
      const a = started.attempt;
      assert.equal(a.deadline.getTime() - a.startedAt.getTime(), 2100000);
      assert.equal((await cookieAttempt(started.token))?._id, a._id);
      assert.equal(await studentExamActive("STUDENT8"), true);
      assert.equal(await cookieAttempt("forged"), null);
      const { sessions, attempts } = await examCollections();
      assert.equal(await sessions.findOne({ _id: started.token }), null);
      const saved = await saveAttempt(
        a,
        {
          revision: 0,
          choices: { q01: 2 },
          code: {
            c01: "let width=8;let height=5;console.log(2*(width+height));",
          },
        },
        false,
      );
      assert.equal(saved.revision, 1);
      assert.equal(
        (await currentAttempt(started.token))?.answers.choices.q01,
        2,
      );
      await assert.rejects(() =>
        saveAttempt(a, { revision: 0, choices: {}, code: {} }, false),
      );
      const resumed = await startAttempt("STUDENT8", started.token);
      assert.equal(resumed.attempt.deadline.getTime(), a.deadline.getTime());
      assert.equal(resumed.attempt.revision, 1);
      await assert.rejects(() => startAttempt("OTHER8", started.token));
      for (const path of [
        "/",
        "/python",
        "/next-classroom",
        "/kodlab/index.html",
        "/admin",
      ]) {
        const response = await proxy(
          new NextRequest(`https://example.test${path}`, {
            headers: { cookie: `${EXAM_COOKIE}=${started.token}` },
          }),
        );
        assert.equal(response.status, 307);
        assert.equal(
          response.headers.get("location"),
          "https://example.test/exam",
        );
      }
      assert.equal(
        (
          await proxy(
            new NextRequest("https://example.test/exam", {
              headers: { cookie: `${EXAM_COOKIE}=${started.token}` },
            }),
          )
        ).headers.get("x-middleware-next"),
        "1",
      );
      assert.equal(
        (
          await progress(
            new Request("https://example.test/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "load",
                studentId: "STUDENT8",
                course: "javascript",
              }),
            }),
          )
        ).status,
        423,
      );
      assert.deepEqual(
        new Set((await teacherExamRows("teacher1")).map((s) => s.studentId)),
        new Set(["STUDENT8", "STUDENT7"]),
      );
      await assert.rejects(() => teacherExamDetail("teacher2", "STUDENT8"));
      await recordDeparture(saved);
      await recordDeparture(saved);
      assert.equal((await currentAttempt(started.token))?.departures, 1);
      await attempts.updateOne(
        { _id: a._id },
        { $set: { deadline: new Date(Date.now() - 1000) } },
      );
      const teacherExpired = (await teacherExamRows("teacher1"))[0];
      assert.equal(teacherExpired.status, "expired");
      assert.equal(teacherExpired.total, 12);
      const expired = await currentAttempt(started.token);
      assert.equal(expired?.status, "expired");
      assert.equal(expired?.result?.total, 12);
      assert.equal(await studentExamActive("STUDENT8"), false);
      await assert.rejects(
        () =>
          saveAttempt(
            saved,
            { revision: 1, choices: { q02: 1 }, code: {} },
            true,
          ),
        (error: unknown) => error instanceof Response && error.status === 409,
      );
      const late = await currentAttempt(started.token);
      assert.equal(late?.status, "expired");
      assert.equal(late?.answers.choices.q01, 2);
      assert.equal(late?.answers.choices.q02, undefined);
      assert.equal(
        (
          await (
            await examAnswerBackups()
          ).findOne({ attemptId: a._id, reason: "after_finish" })
        )?.answers.choices.q02,
        1,
      );
      assert.equal(
        (await startAttempt("STUDENT8", started.token)).attempt.status,
        "expired",
      );
      assert(!("answers" in examView(expired!)));
      await assert.rejects(() => startAttempt("STUDENT8"));
      assert.equal(
        await attempts.countDocuments({ _id: `${EXAM_ID}:STUDENT8` }),
        1,
      );
      const second = await admitted("OTHER8");
      const submitted = await saveAttempt(
        second.attempt,
        { revision: 0, choices: { q01: 2 }, code: {} },
        true,
      );
      assert.equal(submitted.status, "submitted");
      assert.equal(submitted.result?.total, 2);
      assert.equal((await teacherExamRows("teacher2"))[0].total, 2);
      const resetRequest = (headers: Record<string, string>) =>
        new Request("https://example.test/api/admin/exam", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            action: "reset",
            studentId: "OTHER8",
            generation: 0,
          }),
        });
      assert.equal((await adminExamReset(resetRequest({}))).status, 401);
      assert.equal(
        (
          await adminExamReset(
            resetRequest({ Origin: "https://attacker.test" }),
          )
        ).status,
        403,
      );
      await assert.rejects(() => resetStudentExam("teacher1", "OTHER8", 0));
      assert.equal(
        (
          await adminExamReset(
            resetRequest({ Cookie: `${ADMIN_COOKIE}=${adminToken}` }),
          )
        ).status,
        200,
      );
      await resetStudentExam("teacher2", "OTHER8", 0);
      const reset = await attempts.findOne({ _id: second.attempt._id });
      assert.equal(reset?.status, "reset");
      assert.equal(reset?.generation, 1);
      assert.equal(reset?.previousAttempts?.length, 1);
      assert.equal(reset?.previousAttempts?.[0].result?.total, 2);
      assert.deepEqual(reset?.previousAttempts?.[0].answers, submitted.answers);
      assert.equal(reset?.previousAttempts?.[0].resetBy, "teacher2");
      assert.equal(await currentAttempt(second.token), null);
      assert.equal((await teacherExamRows("teacher2"))[0].status, "reset");
      const retake = await admitted("OTHER8");
      assert.equal(retake.attempt.status, "active");
      assert.equal(retake.attempt.generation, 1);
      assert.equal(
        retake.attempt.deadline.getTime() - retake.attempt.startedAt.getTime(),
        2100000,
      );
      assert.deepEqual(retake.attempt.answers.choices, {});
      assert.equal(retake.attempt.result, undefined);
      assert.equal(retake.attempt.revision, 0);
      assert.equal(await cookieAttempt(second.token), null);
      await assert.rejects(() =>
        saveAttempt(
          second.attempt,
          { revision: 0, choices: { q02: 1 }, code: {} },
          false,
        ),
      );
      await assert.rejects(() => finishAttempt(second.attempt, "submitted"));
      await recordDeparture(second.attempt);
      assert.equal((await currentAttempt(retake.token))?.departures, 0);
      await assert.rejects(() => resetStudentExam("teacher2", "OTHER8", 0));
      const history = await teacherExamDetail("teacher2", "OTHER8");
      assert.equal(history.history[0].result?.total, 2);
      assert.deepEqual(history.history[0].answers.choices, { q01: 2 });
      const more = await saveAttempt(
        retake.attempt,
        { revision: 0, choices: { q03: 3 }, code: {} },
        false,
      );
      await resetStudentExam("teacher2", "OTHER8", 1);
      const repeated = await attempts.findOne({ _id: more._id });
      assert.equal(repeated?.previousAttempts?.length, 2);
      assert.equal(repeated?.previousAttempts?.[1].answers.choices.q03, 3);
      assert.equal(await currentAttempt(retake.token), null);
      const extension = await admitted("OTHER8");
      const stale = {
        ...extension.attempt,
        deadline: new Date(Date.now() - 1000),
      };
      await attempts.updateOne(
        { _id: stale._id },
        { $set: { deadline: new Date(Date.now() + 60000) } },
      );
      assert.equal((await finishAttempt(stale, "expired")).status, "active");
      // Pre-upgrade sessions and attempts without generation still work until explicitly reset.
      await sessions.updateOne(
        { sessionHash: tokenHash(started.token) },
        { $unset: { generation: "" } },
      );
      await attempts.updateOne({ _id: a._id }, { $unset: { generation: "" } });
      assert.equal((await currentAttempt(started.token))?.status, "expired");
      await resetStudentExam("teacher1", "STUDENT8", 0);
      assert.equal(await currentAttempt(started.token), null);
      const legacyRetake = await admitted("STUDENT8");
      assert.equal(legacyRetake.attempt.generation, 1);
      assert.equal(
        legacyRetake.attempt.previousAttempts?.[0].result?.total,
        12,
      );
      await profiles.updateOne(
        { _id: "OTHER8" },
        { $set: { deletedAt: new Date() } },
      );
      await assert.rejects(() => currentAttempt(extension.token));
      await db
        .collection<{
          _id: string;
          name: string;
          grade: number;
          teacherIds: string[];
        }>("student_groups")
        .insertMany([
          { _id: "6A", name: "6А", grade: 6, teacherIds: ["teacher1"] },
          { _id: "10A", name: "10А", grade: 10, teacherIds: ["teacher1"] },
        ]);
      await profiles.insertMany(
        [6, 10].map((grade) => ({
          _id: `STUDENT${grade}`,
          sourceId: `source-grade-${grade}`,
          name: `Student Grade ${grade}`,
          groupId: `${grade}A`,
          teacherIds: ["teacher1"],
        })),
      );
      await assert.rejects(() => issueExamCode("STUDENT10", "teacher1"));
      for (const grade of [6, 7]) {
        const studentId = `STUDENT${grade}`;
        const lesson = {
          completed: ["name"],
          drafts: { name: 'let name = "Билгүүн"; console.log(name);' },
        };
        const lessonRequest = (action: string) =>
          progress(
            new Request("https://example.test/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action,
                studentId: studentId.toLowerCase(),
                course: "javascript",
                revision: 0,
                progress: lesson,
              }),
            }),
          );
        assert.equal((await lessonRequest("save")).status, 200);
        assert.deepEqual(
          (await (await lessonRequest("load")).json()).progress,
          lesson,
        );
        const run = await admitted(studentId);
        assert.equal(run.attempt.className, `${grade}А`);
        assert.equal(
          run.attempt.deadline.getTime() - run.attempt.startedAt.getTime(),
          35 * 60000,
        );
        const submittedGrade = await saveAttempt(
          run.attempt,
          { revision: 0, choices: { q01: 2 }, code: {} },
          true,
        );
        assert.equal(submittedGrade.result?.total, 2);
        const teacherRow = (await teacherExamRows("teacher1")).find(
          (s) => s.studentId === studentId,
        );
        assert.equal(teacherRow?.grade, grade);
        assert.equal(teacherRow?.total, 2);
        await assert.rejects(() => teacherExamDetail("teacher2", studentId));
        await assert.rejects(() =>
          resetClassExam("teacher2", `${grade}A`, [
            { studentId, generation: 0 },
          ]),
        );
        const classReset = await resetClassExam("teacher1", `${grade}A`, [
          { studentId, generation: 0 },
        ]);
        assert.deepEqual(classReset.ready, [studentId]);
        assert.equal(await currentAttempt(run.token), null);
        const next = await admitted(studentId);
        assert.equal(next.attempt.generation, 1);
        assert.deepEqual(next.attempt.answers.choices, {});
        assert.equal(next.attempt.previousAttempts?.[0].result?.total, 2);
      }
      assert.equal(
        (await teacherExamRows("teacher1")).some(
          (s) => s.studentId === "STUDENT10",
        ),
        false,
      );
      // Two teachers share this class; a class reset must still follow student ownership.
      await db
        .collection<{
          _id: string;
          name: string;
          grade: number;
          teacherIds: string[];
        }>("student_groups")
        .insertOne({
          _id: "BULK",
          name: "8Б",
          grade: 8,
          teacherIds: ["teacher1", "teacher2"],
        });
      await profiles.insertMany(
        ["BULK1", "BULK2", "BULK3", "BULK4", "BULKOTHER"].map((id) => ({
          _id: id,
          sourceId: `source-${id}`,
          name: id,
          groupId: "BULK",
          teacherIds: [id === "BULKOTHER" ? "teacher1" : "teacher2"],
        })),
      );
      const bulkOne = await admitted("BULK1");
      await saveAttempt(
        bulkOne.attempt,
        { revision: 0, choices: { q01: 2 }, code: {} },
        true,
      );
      const bulkTwo = await admitted("BULK2");
      await saveAttempt(
        bulkTwo.attempt,
        { revision: 0, choices: { q02: 1 }, code: {} },
        false,
      );
      await admitted("BULK4");
      await resetStudentExam("teacher2", "BULK4", 0);
      const targets = [
        { studentId: "BULK1", generation: 0 },
        { studentId: "BULK2", generation: 0 },
      ];
      const bulkRequest = (
        body: Record<string, unknown>,
        headers: Record<string, string> = {
          Cookie: `${ADMIN_COOKIE}=${adminToken}`,
        },
      ) =>
        new Request("https://example.test/api/admin/exam", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(body),
        });
      const bulkBody = { action: "reset-class", groupId: "BULK", targets };
      assert.equal(
        (await adminExamReset(bulkRequest(bulkBody, {}))).status,
        401,
      );
      assert.equal(
        (
          await adminExamReset(
            bulkRequest(bulkBody, {
              Origin: "https://attacker.test",
              Cookie: `${ADMIN_COOKIE}=${adminToken}`,
            }),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await adminExamReset(
            bulkRequest({
              ...bulkBody,
              targets: [...targets, { studentId: "BULKOTHER", generation: 0 }],
            }),
          )
        ).status,
        403,
      );
      assert.equal((await currentAttempt(bulkTwo.token))?.status, "active");
      assert.equal(
        (await adminExamReset(bulkRequest({ ...bulkBody, groupId: "8A" })))
          .status,
        403,
      );
      assert.equal(
        (
          await adminExamReset(
            bulkRequest({ ...bulkBody, targets: [targets[0], targets[0]] }),
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await adminExamReset(
            bulkRequest({
              ...bulkBody,
              targets: [{ studentId: "BULK1", generation: -1 }],
            }),
          )
        ).status,
        400,
      );
      const bulkResponse = await adminExamReset(bulkRequest(bulkBody));
      assert.equal(bulkResponse.status, 200);
      const bulkResult = await bulkResponse.json();
      assert.deepEqual(new Set(bulkResult.ready), new Set(["BULK1", "BULK2"]));
      assert.deepEqual(bulkResult.changed, []);
      assert.deepEqual(bulkResult.failed, []);
      assert.equal(await currentAttempt(bulkTwo.token), null);
      assert.equal(
        (await teacherExamDetail("teacher2", "BULK1")).history[0].result?.total,
        2,
      );
      assert.equal(
        (await teacherExamDetail("teacher2", "BULK2")).history[0].answers
          .choices.q02,
        1,
      );
      assert.equal(
        (await teacherExamDetail("teacher2", "BULK4")).generation,
        1,
      );
      assert.equal(await attempts.countDocuments({ studentId: "BULK3" }), 0);
      await resetClassExam("teacher2", "BULK", targets);
      assert.equal(
        (await teacherExamDetail("teacher2", "BULK1")).history.length,
        1,
      );
      const newRun = await admitted("BULK1");
      const repeatedBatch = await resetClassExam("teacher2", "BULK", targets);
      assert.deepEqual(repeatedBatch.changed, ["BULK1"]);
      assert.deepEqual(repeatedBatch.ready, ["BULK2"]);
      assert.equal((await currentAttempt(newRun.token))?.status, "active");
      assert.equal(
        (await teacherExamDetail("teacher2", "BULK1")).history.length,
        1,
      );
      await assert.rejects(() => resetClassExam("teacher2", "7A", targets));
      await profiles.insertOne({
        _id: "SYNC8",
        sourceId: "sync",
        name: "Sync Test",
        groupId: "8A",
        teacherIds: ["teacher1"],
      });
      const sync = await admitted("SYNC8");
      const firstSave = await saveAttempt(
        sync.attempt,
        { revision: 0, choices: { q10: 1 }, code: {} },
        false,
      );
      const idleSave = await saveAttempt(
        firstSave,
        { revision: 1, ...firstSave.answers },
        false,
      );
      assert.equal(
        idleSave.revision,
        1,
        "An idle tab must not advance the saved version",
      );
      const recovered = await saveAttempt(
        firstSave,
        { revision: 0, choices: { q10: 1, q16: 2 }, code: {} },
        false,
      );
      assert.equal(recovered.revision, 2);
      assert.deepEqual(recovered.answers.choices, { q10: 1, q16: 2 });
      const acknowledged = await saveAttempt(
        recovered,
        { revision: 0, ...recovered.answers },
        false,
      );
      assert.equal(
        acknowledged.revision,
        2,
        "Retrying a lost response must not write again",
      );
      await assert.rejects(() =>
        saveAttempt(
          recovered,
          { revision: 0, choices: { q10: 1 }, code: {} },
          false,
        ),
      );
      await assert.rejects(() =>
        saveAttempt(
          recovered,
          { revision: 0, choices: { q10: 3, q16: 2 }, code: {} },
          false,
        ),
      );
      assert.deepEqual(
        (await currentAttempt(sync.token))?.answers,
        recovered.answers,
      );
      const oneWriter = "single-tab-writer-0000000001";
      const ownFirst = await saveAttempt(
        recovered,
        {
          revision: recovered.revision,
          baseAnswers: recovered.answers,
          writerId: oneWriter,
          choices: { q10: 2, q16: 2 },
          code: {},
        },
        false,
      );
      const ownSecond = await saveAttempt(
        ownFirst,
        {
          revision: recovered.revision,
          baseAnswers: recovered.answers,
          writerId: oneWriter,
          choices: { q10: 3, q16: 2, q20: 1 },
          code: {},
        },
        false,
      );
      assert.equal(
        ownSecond.answers.choices.q10,
        3,
        "One tab can revise its own unacknowledged answer",
      );
      assert.equal(ownSecond.answers.choices.q20, 1);
      await assert.rejects(() =>
        saveAttempt(
          ownSecond,
          {
            revision: recovered.revision,
            baseAnswers: recovered.answers,
            writerId: "different-tab-writer-0000002",
            choices: { q10: 0, q16: 2 },
            code: {},
          },
          false,
        ),
      );
      const backups = await (
        await examAnswerBackups()
      )
        .find({ attemptId: ownSecond._id })
        .toArray();
      assert(backups.some((b) => b.answers.choices.q10 === 0));
      const count = backups.length;
      await assert.rejects(() =>
        saveAttempt(
          ownSecond,
          {
            revision: recovered.revision,
            baseAnswers: recovered.answers,
            writerId: "different-tab-writer-0000002",
            choices: { q10: 0, q16: 2 },
            code: {},
          },
          false,
        ),
      );
      assert.equal(
        await (
          await examAnswerBackups()
        ).countDocuments({ attemptId: ownSecond._id }),
        count,
        "Backup retries are idempotent",
      );
      const visibleRecovery = await teacherExamDetail("teacher1", "SYNC8");
      assert(
        visibleRecovery.recoveryBackups.some(
          (b) => b.answers.choices.q10 === 0,
        ),
      );
      await assert.rejects(() => teacherExamDetail("teacher2", "SYNC8"));
      assert.deepEqual(
        (await currentAttempt(sync.token))?.answers,
        ownSecond.answers,
      );
      await assert.rejects(
        () => endExamSession(sync.token),
        /Эхлээд шалгалтаа/,
      );
      assert.equal((await currentAttempt(sync.token))?.status, "active");
      const completed = await saveAttempt(
        ownSecond,
        { revision: ownSecond.revision, ...ownSecond.answers },
        true,
      );
      const completedRecord = await attempts.findOne({ _id: completed._id });
      await endExamSession(sync.token);
      assert.equal(await currentAttempt(sync.token), null);
      assert.deepEqual(
        await attempts.findOne({ _id: completed._id }),
        completedRecord,
        "Switching students must preserve the result and saved answers",
      );
      await endExamSession(sync.token);
      await profiles.insertOne({
        _id: "NEXT8",
        sourceId: "next-student",
        name: "Next Student",
        groupId: "8A",
        teacherIds: ["teacher1"],
      });
      const nextStudent = await admitted("NEXT8", sync.token);
      assert.equal(nextStudent.attempt.studentId, "NEXT8");
      assert.deepEqual(nextStudent.attempt.answers.choices, {});
      assert.equal(nextStudent.attempt.revision, 0);
      assert.equal(
        nextStudent.attempt.deadline.getTime() -
          nextStudent.attempt.startedAt.getTime(),
        35 * 60000,
      );
      const api = (body: Record<string, unknown>, token = nextStudent.token) =>
        examPost(
          new Request("https://example.test/api/exam", {
            method: "POST",
            headers: {
              Origin: "https://example.test",
              "Content-Type": "application/json",
              Cookie: `${EXAM_COOKIE}=${token}`,
            },
            body: JSON.stringify(body),
          }),
        );
      const identity = { studentId: "NEXT8", generation: 0 };
      const blank = structuredClone(nextStudent.attempt.answers);
      for (const action of [
        "save",
        "submit",
        "sample",
        "departure",
        "next-student",
      ]) {
        for (const identity of [
          {},
          { studentId: "SYNC8", generation: 0 },
          { studentId: "NEXT8", generation: 1 },
        ]) {
          const rejected = await api({
            action,
            ...identity,
            revision: 0,
            choices: { q01: 3 },
            code: {},
          });
          assert.equal(
            rejected.status,
            409,
            `${action} must reject missing or mismatched identity`,
          );
        }
      }
      assert.equal((await currentAttempt(nextStudent.token))?.revision, 0);
      const fullAnswers = {
        choices: Object.fromEntries(examQuestions.map((q, i) => [q.id, i % 4])),
        code: Object.fromEntries(
          examExercises.map((e, i) => [
            e.id,
            `${e.starter}console.log(${i}); //${"а".repeat(9000)}`,
          ]),
        ),
      };
      const writerId = "full-flow-single-writer-00001";
      const saveBody = {
        action: "save",
        ...identity,
        revision: 0,
        baseAnswers: blank,
        writerId,
        ...fullAnswers,
      };
      const firstResponse = await api(saveBody);
      assert.equal(firstResponse.status, 200);
      const firstSaved = (await firstResponse.json()).attempt;
      assert.deepEqual(
        firstSaved.answers,
        fullAnswers,
        "All 20 choices and six code responses are saved exactly",
      );
      const lostAckRetry = await api(saveBody);
      assert.equal(lostAckRetry.status, 200);
      assert.equal(
        (await lostAckRetry.json()).attempt.revision,
        firstSaved.revision,
      );
      assert.deepEqual(
        (await currentAttempt(nextStudent.token))?.answers,
        fullAnswers,
        "Reload preserves every answer",
      );
      const lastEdit = structuredClone(fullAnswers);
      lastEdit.choices.q20 = 3;
      lastEdit.code.c06 += "\nconsole.log(99);";
      const submittedResponse = await api({
        ...saveBody,
        action: "submit",
        ...lastEdit,
      });
      assert.equal(submittedResponse.status, 200);
      const submittedView = (await submittedResponse.json()).attempt;
      assert.equal(submittedView.status, "submitted");
      assert.equal("answers" in submittedView, false);
      const resultBefore = await attempts.findOne({ studentId: "NEXT8" });
      assert.deepEqual(
        resultBefore?.answers,
        lastEdit,
        "Submission retains the final edit on the teacher side",
      );
      assert.deepEqual(resultBefore?.result, gradeExam(lastEdit));
      const repeatBody = {
        ...saveBody,
        action: "submit",
        ...lastEdit,
        baseAnswers: lastEdit,
      };
      assert(Buffer.byteLength(JSON.stringify(repeatBody)) > 192 * 1024);
      const duplicateSubmit = await api(repeatBody);
      assert.equal(duplicateSubmit.status, 200);
      assert.deepEqual(
        await attempts.findOne({ studentId: "NEXT8" }),
        resultBefore,
        "Duplicate submit cannot change the result",
      );
      await endExamSession(nextStudent.token);
      assert.equal(
        (await api(saveBody)).status,
        401,
        "A logged-out session cannot save",
      );
      await profiles.insertOne({
        _id: "THIRD8",
        sourceId: "third-student",
        name: "Third Student",
        groupId: "8A",
        teacherIds: ["teacher1"],
      });
      const third = await admitted("THIRD8", nextStudent.token);
      assert.deepEqual(third.attempt.answers, blank);
      assert.equal(
        third.attempt.deadline.getTime() - third.attempt.startedAt.getTime(),
        35 * 60000,
      );
      assert.equal(
        (await api(saveBody, third.token)).status,
        409,
        "A stale page cannot save into the new student's cookie",
      );
      assert.equal(
        (await api({ action: "next-student", ...identity }, third.token))
          .status,
        409,
        "A stale finished screen cannot sign out the new student",
      );
      assert.deepEqual(
        await attempts.findOne({ studentId: "NEXT8" }),
        resultBefore,
      );
      assert.deepEqual((await currentAttempt(third.token))?.answers, blank);
      const thirdIdentity = { studentId: "THIRD8", generation: 0 };
      const beforeExpiry = await api(
        {
          action: "save",
          ...thirdIdentity,
          revision: 0,
          choices: { q01: 1 },
          code: blank.code,
        },
        third.token,
      );
      assert.equal(beforeExpiry.status, 200);
      await attempts.updateOne(
        { _id: third.attempt._id },
        { $set: { deadline: new Date(Date.now() - 1000) } },
      );
      const lateSubmit = await api(
        { action: "submit", ...thirdIdentity, revision: 1, ...fullAnswers },
        third.token,
      );
      assert.equal(lateSubmit.status, 409);
      assert.equal((await lateSubmit.json()).code, "exam_recovery_saved");
      const thirdExpired = await attempts.findOne({ _id: third.attempt._id });
      assert.equal(thirdExpired?.status, "expired");
      assert.deepEqual(thirdExpired?.answers.choices, { q01: 1 });
      assert.deepEqual(
        (
          await (
            await examAnswerBackups()
          ).findOne({ attemptId: third.attempt._id, reason: "after_finish" })
        )?.answers,
        fullAnswers,
        "All late answers remain in a recovery copy without rewriting the official result",
      );
    } finally {
      const pool = globalThis as typeof globalThis & {
        classroomMongo?: Promise<MongoClient>;
      };
      await (await pool.classroomMongo)?.close();
      delete pool.classroomMongo;
      const stopped = new Promise((resolve) => proc.once("exit", resolve));
      proc.kill("SIGTERM");
      await stopped;
      await rm(dir, { recursive: true, force: true });
    }
  },
);
