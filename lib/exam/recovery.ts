import { createHash } from "node:crypto";
import { classroomDatabase } from "../student/database";
import type { ExamAnswers } from "./protocol";
import type { ExamAttempt } from "./types";

export type ExamAnswerBackup = {
  _id: string;
  attemptId: string;
  studentId: string;
  generation: number;
  reason: "save_conflict" | "after_finish";
  answers: ExamAnswers;
  clientRevision: number | null;
  serverRevision: number;
  receivedAt: Date;
};

export async function examAnswerBackups() {
  return (await classroomDatabase()).collection<ExamAnswerBackup>(
    "exam_answer_backups",
  );
}

export async function preserveExamAnswers(
  attempt: ExamAttempt,
  answers: ExamAnswers,
  reason: ExamAnswerBackup["reason"],
  revision: unknown,
) {
  const canonical = {
    choices: Object.entries(answers.choices).sort(),
    code: Object.entries(answers.code).sort(),
  };
  const _id = createHash("sha256")
    .update(
      JSON.stringify([attempt._id, attempt.generation || 0, reason, canonical]),
    )
    .digest("hex");
  await (
    await examAnswerBackups()
  ).updateOne(
    { _id },
    {
      $setOnInsert: {
        attemptId: attempt._id,
        studentId: attempt.studentId,
        generation: attempt.generation || 0,
        reason,
        answers,
        clientRevision:
          typeof revision === "number" && Number.isSafeInteger(revision)
            ? revision
            : null,
        serverRevision: attempt.revision,
        receivedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export function recoverySavedError(finished: boolean) {
  return Response.json(
    {
      code: "exam_recovery_saved",
      error: finished
        ? "Шалгалт дууссан боловч энэ цонхны өөр хариултыг нөөцөд хадгаллаа. Оноонд автоматаар ороогүй тул багшдаа хандана уу."
        : "Хариултын хадгалсан хувилбар зөрлөө. Энэ цонхны ажлыг нөөцөд хадгаллаа. Хуудсаа хаахгүйгээр багшдаа хандана уу.",
    },
    { status: 409 },
  );
}
