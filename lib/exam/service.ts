import { randomBytes } from "node:crypto";
import { adminCollections, AccessError, InputError } from "../admin/data";
import {
  EXAM_ID,
  EXAM_MINUTES,
  EXAM_GRADES,
  examExercises,
  examQuestions,
} from "./content";
import { examCollections } from "./collections";
import { cookieAttempt, tokenHash } from "./access";
import { gradeExam } from "./grading";
import { parseAnswers } from "./protocol";
import { mergeExamAnswers, sameExamAnswers } from "./sync";
import {
  examAnswerBackups,
  preserveExamAnswers,
  recoverySavedError,
} from "./recovery";
import type {
  ClassExamResetResult,
  ExamAttempt,
  ExamResetTarget,
  ExamView,
  TeacherExamRow,
} from "./types";

function runIdentity(attempt: ExamAttempt) {
  return {
    _id: attempt._id,
    generation: attempt.generation ?? { $exists: false },
  };
}
function resetError() {
  return Response.json(
    {
      code: "exam_reset",
      error:
        "Шалгалтыг багш шинэчилсэн байна. Хуудсаа шинэчлээд ID-гаар дахин нэвтэрнэ үү.",
    },
    { status: 409 },
  );
}
function assertSameRun(before: ExamAttempt, after: ExamAttempt) {
  if (
    (before.generation || 0) !== (after.generation || 0) ||
    after.status === "reset"
  )
    throw resetError();
}

export async function eligibleStudent(studentId: string) {
  const { profiles, groups } = await adminCollections();
  const profile = await profiles.findOne({
    _id: studentId,
    sourceId: { $type: "string" },
    deletedAt: { $exists: false },
  });
  const group = profile?.groupId
    ? await groups.findOne({
        _id: profile.groupId,
        grade: { $in: EXAM_GRADES },
      })
    : null;
  if (!profile || !group)
    throw new AccessError(
      "Зөвхөн бүртгэлтэй 6, 7, 8-р ангийн сурагч шалгалтад орно. ID-гаа шалгаад багшдаа хандана уу.",
    );
  return { profile, group };
}
export async function finishAttempt(
  attempt: ExamAttempt,
  status: "submitted" | "expired",
) {
  if (attempt.status !== "active") return attempt;
  if (status === "expired" && attempt.deadline.getTime() > Date.now())
    return attempt;
  const { attempts } = await examCollections();
  const updated = await attempts.findOneAndUpdate(
    {
      ...runIdentity(attempt),
      status: "active",
      revision: attempt.revision,
      deadline: attempt.deadline,
    },
    {
      $set: {
        status,
        result: gradeExam(attempt.answers),
        submittedAt: status === "expired" ? attempt.deadline : new Date(),
      },
    },
    { returnDocument: "after" },
  );
  if (updated) return updated;
  const latest = await attempts.findOne({ _id: attempt._id });
  if (!latest) throw new AccessError("Шалгалтын бүртгэл олдсонгүй.");
  assertSameRun(attempt, latest);
  // A save won the race: grade that saved revision rather than overwrite it.
  return finishAttempt(latest, status);
}
export async function currentAttempt(token?: string) {
  const attempt = await cookieAttempt(token);
  if (!attempt) return null;
  await eligibleStudent(attempt.studentId);
  return attempt.status === "active" && attempt.deadline.getTime() <= Date.now()
    ? finishAttempt(attempt, "expired")
    : attempt;
}
export async function endExamSession(token?: string) {
  const attempt = await cookieAttempt(token);
  if (attempt?.status === "active") {
    if (attempt.deadline.getTime() > Date.now())
      throw new AccessError("Эхлээд шалгалтаа дуусгаж илгээнэ үү.");
    await finishAttempt(attempt, "expired");
  }
  if (token)
    await (
      await examCollections()
    ).sessions.deleteOne({ _id: tokenHash(token) });
}
export function examView(attempt: ExamAttempt): ExamView {
  if (attempt.status === "reset") throw resetError();
  return {
    studentId: attempt.studentId,
    name: attempt.name,
    className: attempt.className,
    status: attempt.status,
    generation: attempt.generation || 0,
    deadline: attempt.deadline.toISOString(),
    revision: attempt.revision,
    departures: attempt.departures,
    answers: attempt.answers,
    questions: attempt.status === "active" ? examQuestions : [],
    exercises: attempt.status === "active" ? examExercises : [],
  };
}
export async function startAttempt(studentId: string, token?: string) {
  const existing = await currentAttempt(token);
  if (existing?.status === "active" && existing.studentId !== studentId)
    throw new AccessError("Идэвхтэй шалгалтын сурагчийг солих боломжгүй.");
  const { profile, group } = await eligibleStudent(studentId);
  const { attempts, sessions } = await examCollections();
  const now = new Date();
  const _id = `${EXAM_ID}:${studentId}`;
  try {
    await attempts.updateOne(
      { _id },
      {
        $setOnInsert: {
          examId: EXAM_ID,
          studentId,
          name: profile.name,
          groupId: group._id,
          className: group.name,
          startedAt: now,
          deadline: new Date(now.getTime() + EXAM_MINUTES * 60000),
          status: "active",
          answers: {
            choices: {},
            code: Object.fromEntries(
              examExercises.map((e) => [e.id, e.starter]),
            ),
          },
          revision: 0,
          departures: 0,
          generation: 0,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== 11000
    )
      throw error;
  }
  let attempt = await attempts.findOne({ _id });
  if (!attempt) throw new Error("Attempt not created");
  if (attempt.status === "reset") {
    await attempts.updateOne(
      { ...runIdentity(attempt), status: "reset" },
      {
        $set: {
          name: profile.name,
          groupId: group._id,
          className: group.name,
          status: "active",
          startedAt: now,
          deadline: new Date(now.getTime() + EXAM_MINUTES * 60000),
          answers: {
            choices: {},
            code: Object.fromEntries(
              examExercises.map((e) => [e.id, e.starter]),
            ),
          },
          revision: 0,
          departures: 0,
        },
        $unset: { result: "", submittedAt: "", lastDepartureAt: "" },
      },
    );
    attempt = await attempts.findOne({ _id });
    if (!attempt || attempt.status === "reset") throw resetError();
  }
  const nextToken = randomBytes(32).toString("base64url");
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await sessions.insertOne({
    _id: tokenHash(nextToken),
    attemptId: _id,
    generation: attempt.generation || 0,
    expiresAt: new Date(Date.now() + 8 * 3600000),
  });
  const final =
    attempt.status === "active" && attempt.deadline.getTime() <= Date.now()
      ? await finishAttempt(attempt, "expired")
      : attempt;
  return { attempt: final, token: nextToken };
}
export async function saveAttempt(
  attempt: ExamAttempt,
  body: Record<string, unknown>,
  submit: boolean,
) {
  if (attempt.status === "reset") throw resetError();
  let answers;
  try {
    answers = parseAnswers(body);
  } catch (error) {
    throw new InputError(
      error instanceof Error ? error.message : "Хариултаа шалгаарай.",
    );
  }
  if (attempt.status !== "active") {
    if (!sameExamAnswers(answers, attempt.answers)) {
      await preserveExamAnswers(
        attempt,
        answers,
        "after_finish",
        body.revision,
      );
      throw recoverySavedError(true);
    }
    return attempt;
  }
  const writerId =
    typeof body.writerId === "string" && /^[\w-]{20,80}$/.test(body.writerId)
      ? body.writerId
      : undefined;
  if (body.writerId !== undefined && !writerId)
    throw new InputError("Хадгалалтын мэдээлэл буруу байна.");
  if (body.baseAnswers !== undefined) {
    let baseAnswers;
    try {
      if (
        !body.baseAnswers ||
        typeof body.baseAnswers !== "object" ||
        Array.isArray(body.baseAnswers) ||
        !("choices" in body.baseAnswers) ||
        !("code" in body.baseAnswers)
      )
        throw new Error();
      baseAnswers = parseAnswers({
        choices: body.baseAnswers.choices,
        code: body.baseAnswers.code,
      });
    } catch {
      throw new InputError("Хадгалалтын суурь хариулт буруу байна.");
    }
    try {
      answers = mergeExamAnswers(
        baseAnswers,
        answers,
        attempt.answers,
        !!writerId && writerId === attempt.lastWriterId,
      );
    } catch {
      await preserveExamAnswers(
        attempt,
        answers,
        "save_conflict",
        body.revision,
      );
      throw recoverySavedError(false);
    }
  }
  let safeStaleSave =
    body.baseAnswers !== undefined &&
    Number.isInteger(body.revision) &&
    Number(body.revision) >= 0 &&
    Number(body.revision) < attempt.revision;
  if (
    Number.isInteger(body.revision) &&
    Number(body.revision) >= 0 &&
    Number(body.revision) < attempt.revision
  ) {
    try {
      const combined = mergeExamAnswers(
        {
          choices: {},
          code: Object.fromEntries(examExercises.map((e) => [e.id, e.starter])),
        },
        answers,
        attempt.answers,
      );
      // Older open tabs can recover only when their snapshot preserves every saved answer.
      safeStaleSave = sameExamAnswers(combined, answers) || safeStaleSave;
    } catch {
      /* Conflicting answers still require explicit reconciliation. */
    }
  }
  if (
    !Number.isInteger(body.revision) ||
    (body.revision !== attempt.revision && !safeStaleSave)
  ) {
    await preserveExamAnswers(attempt, answers, "save_conflict", body.revision);
    throw recoverySavedError(false);
  }
  const now = new Date();
  const { attempts } = await examCollections();
  const filter = {
    ...runIdentity(attempt),
    status: "active" as const,
    revision: attempt.revision,
    deadline: { $gt: now },
  };
  const updated = sameExamAnswers(answers, attempt.answers)
    ? await attempts.findOne(filter)
    : await attempts.findOneAndUpdate(
        filter,
        {
          $set: { answers, ...(writerId ? { lastWriterId: writerId } : {}) },
          $inc: { revision: 1 },
          ...(writerId ? {} : { $unset: { lastWriterId: "" } }),
        },
        { returnDocument: "after" },
      );
  if (!updated) {
    const saved = await (
      await examCollections()
    ).attempts.findOne({ _id: attempt._id });
    if (saved) assertSameRun(attempt, saved);
    if (saved && saved.deadline.getTime() <= Date.now()) {
      const finished = await finishAttempt(saved, "expired");
      if (!sameExamAnswers(answers, finished.answers)) {
        await preserveExamAnswers(
          finished,
          answers,
          "after_finish",
          body.revision,
        );
        throw recoverySavedError(true);
      }
      return finished;
    }
    await preserveExamAnswers(attempt, answers, "save_conflict", body.revision);
    throw Response.json(
      {
        error:
          "Хадгалалт давхацлаа. Дахин хадгална уу. Энэ цонхны ажлыг нөөцөд хадгалсан.",
      },
      { status: 409 },
    );
  }
  return submit ? finishAttempt(updated, "submitted") : updated;
}
export async function recordDeparture(attempt: ExamAttempt) {
  if (attempt.status !== "active") return;
  const now = new Date();
  await (
    await examCollections()
  ).attempts.updateOne(
    {
      ...runIdentity(attempt),
      status: "active",
      deadline: { $gt: now },
      $or: [
        { lastDepartureAt: { $exists: false } },
        { lastDepartureAt: { $lt: new Date(now.getTime() - 2000) } },
      ],
    },
    { $inc: { departures: 1 }, $set: { lastDepartureAt: now } },
  );
}
export async function teacherExamRows(
  teacherId: string,
): Promise<TeacherExamRow[]> {
  const { profiles, groups } = await adminCollections();
  const classes = await groups
    .find({ teacherIds: teacherId, grade: { $in: EXAM_GRADES } })
    .toArray();
  const students = await profiles
    .find({
      teacherIds: teacherId,
      groupId: { $in: classes.map((g) => g._id) },
      sourceId: { $type: "string" },
      deletedAt: { $exists: false },
    })
    .sort({ name: 1 })
    .toArray();
  const saved = await (
    await examCollections()
  ).attempts
    .find(
      { examId: EXAM_ID, studentId: { $in: students.map((s) => s._id) } },
      { projection: { previousAttempts: 0 } },
    )
    .toArray();
  const finalized = await Promise.all(
    saved.map((a) =>
      a.status === "active" && a.deadline.getTime() <= Date.now()
        ? finishAttempt(a, "expired")
        : a,
    ),
  );
  const byId = new Map(finalized.map((a) => [a.studentId, a]));
  return students.map((s) => {
    const a = byId.get(s._id);
    return {
      studentId: s._id,
      name: s.name,
      className: classes.find((g) => g._id === s.groupId)?.name || "",
      grade: classes.find((g) => g._id === s.groupId)?.grade,
      groupId: s.groupId || "",
      generation: a?.generation || 0,
      previousAttempts: a?.generation || 0,
      status: a?.status || "not-started",
      startedAt: a?.startedAt.toISOString() || null,
      submittedAt: a?.submittedAt?.toISOString() || null,
      departures: a?.departures || 0,
      quizPoints: a?.result?.quizPoints ?? null,
      codePoints: a?.result?.codePoints ?? null,
      total: a?.result?.total ?? null,
    };
  });
}
export async function teacherExamDetail(teacherId: string, studentId: string) {
  const { profiles } = await adminCollections();
  if (
    !(await profiles.findOne({
      _id: studentId,
      teacherIds: teacherId,
      sourceId: { $type: "string" },
      deletedAt: { $exists: false },
    }))
  )
    throw new AccessError("Энэ сурагчид хандах эрхгүй байна.");
  let a = await (
    await examCollections()
  ).attempts.findOne({ _id: `${EXAM_ID}:${studentId}` });
  if (!a) throw new InputError("Сурагч шалгалтаа эхлээгүй байна.");
  if (a.status === "active" && a.deadline.getTime() <= Date.now())
    a = await finishAttempt(a, "expired");
  const backups = await (
    await examAnswerBackups()
  )
    .find({ attemptId: a._id })
    .sort({ receivedAt: -1 })
    .limit(100)
    .toArray();
  return {
    studentId: a.studentId,
    name: a.name,
    className: a.className,
    status: a.status,
    answers: a.answers,
    recoveryBackups: backups.map((backup) => ({
      ...backup,
      receivedAt: backup.receivedAt.toISOString(),
    })),
    result: a.result || null,
    questions: examQuestions,
    exercises: examExercises,
    departures: a.departures,
    generation: a.generation || 0,
    previousAttempts: a.previousAttempts?.length || 0,
    history: (a.previousAttempts || []).map((previous) => ({
      generation: previous.generation || 0,
      status: previous.status,
      answers: previous.answers,
      result: previous.result || null,
      startedAt: previous.startedAt.toISOString(),
      deadline: previous.deadline.toISOString(),
      submittedAt: previous.submittedAt?.toISOString() || null,
      resetAt: previous.resetAt.toISOString(),
      resetBy: previous.resetBy,
    })),
  };
}

export async function resetStudentExam(
  teacherId: string,
  studentId: string,
  generation: number,
) {
  const { profiles } = await adminCollections();
  if (
    !(await profiles.findOne({
      _id: studentId,
      teacherIds: teacherId,
      sourceId: { $type: "string" },
      deletedAt: { $exists: false },
    }))
  )
    throw new AccessError("Энэ сурагчид хандах эрхгүй байна.");
  await eligibleStudent(studentId);
  const { attempts, sessions } = await examCollections();
  const attempt = await attempts.findOne({ _id: `${EXAM_ID}:${studentId}` });
  if (!attempt) throw new InputError("Сурагч шалгалтаа эхлээгүй байна.");
  if (
    attempt.status === "reset" &&
    (attempt.generation || 0) === generation + 1
  )
    return;
  if ((attempt.generation || 0) !== generation || attempt.status === "reset")
    throw resetError();
  // Snapshot and freeze in one write, including any answers saved immediately before reset.
  // shortcut: history is embedded; move it to a separate collection before 100 retakes per student.
  const updated = await attempts.findOneAndUpdate(
    { ...runIdentity(attempt), status: { $ne: "reset" } },
    [
      {
        $set: {
          previousAttempts: {
            $concatArrays: [
              { $ifNull: ["$previousAttempts", []] },
              [
                {
                  startedAt: "$startedAt",
                  deadline: "$deadline",
                  status: "$status",
                  generation: { $ifNull: ["$generation", 0] },
                  answers: "$answers",
                  revision: "$revision",
                  departures: "$departures",
                  result: "$result",
                  submittedAt: "$submittedAt",
                  resetBy: { $literal: teacherId },
                  resetAt: "$$NOW",
                },
              ],
            ],
          },
          generation: { $add: [{ $ifNull: ["$generation", 0] }, 1] },
          status: "reset",
          answers: { choices: {}, code: {} },
          revision: 0,
          departures: 0,
          result: "$$REMOVE",
          submittedAt: "$$REMOVE",
          lastDepartureAt: "$$REMOVE",
        },
      },
    ],
    { returnDocument: "after" },
  );
  if (!updated) throw resetError();
  await sessions.deleteMany({
    attemptId: attempt._id,
    generation: { $ne: updated.generation },
  });
}

export async function resetClassExam(
  teacherId: string,
  groupId: string,
  targets: ExamResetTarget[],
): Promise<ClassExamResetResult> {
  const { profiles, groups } = await adminCollections();
  if (
    !(await groups.findOne({
      _id: groupId,
      grade: { $in: EXAM_GRADES },
      teacherIds: teacherId,
    }))
  )
    throw new AccessError("Энэ ангид хандах эрхгүй байна.");
  const assigned = await profiles
    .find(
      {
        _id: { $in: targets.map((target) => target.studentId) },
        groupId,
        teacherIds: teacherId,
        sourceId: { $type: "string" },
        deletedAt: { $exists: false },
      },
      { projection: { _id: 1 } },
    )
    .toArray();
  // Authorize the entire request before any student is changed.
  if (assigned.length !== targets.length)
    throw new AccessError(
      "Зөвхөн энэ ангийн танд хуваарилсан сурагчдыг сонгоно уу.",
    );
  const result: ClassExamResetResult = { ready: [], changed: [], failed: [] };
  for (let offset = 0; offset < targets.length; offset += 4) {
    await Promise.all(
      targets.slice(offset, offset + 4).map(async (target) => {
        try {
          await resetStudentExam(
            teacherId,
            target.studentId,
            target.generation,
          );
          result.ready.push(target.studentId);
        } catch (error) {
          if (
            (error instanceof Response && error.status === 409) ||
            error instanceof AccessError ||
            error instanceof InputError
          )
            result.changed.push(target.studentId);
          else {
            result.failed.push(target.studentId);
            console.error(
              JSON.stringify({
                event: "class_exam_reset_failed",
                name: error instanceof Error ? error.name : "UnknownError",
              }),
            );
          }
        }
      }),
    );
  }
  return result;
}
