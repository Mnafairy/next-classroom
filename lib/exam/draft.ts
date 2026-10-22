import { parseAnswers, type ExamAnswers } from "./protocol";
import { mergeExamAnswers } from "./sync";
import type { ExamView } from "./types";

export type RestoredExamDraft = {
  answers: ExamAnswers;
  baseAnswers: ExamAnswers;
  revision: number;
  conflict: boolean;
};

export function restoreExamDraft(
  attempt: ExamView,
  raw: string | null,
): RestoredExamDraft | null {
  try {
    const saved = JSON.parse(raw || "null");
    if (
      !saved ||
      (saved.generation || 0) !== attempt.generation ||
      !Number.isInteger(saved.revision) ||
      saved.revision < 0
    )
      return null;
    const answers = parseAnswers(saved.answers);
    const baseAnswers = saved.baseAnswers
      ? parseAnswers(saved.baseAnswers)
      : {
          choices: {},
          code: Object.fromEntries(
            attempt.exercises.map((e) => [e.id, e.starter]),
          ),
        };
    if (saved.revision === attempt.revision)
      return {
        answers,
        baseAnswers: attempt.answers,
        revision: attempt.revision,
        conflict: false,
      };
    try {
      return {
        answers: mergeExamAnswers(baseAnswers, answers, attempt.answers),
        baseAnswers: attempt.answers,
        revision: attempt.revision,
        conflict: false,
      };
    } catch {
      // Retain both the student's draft and its baseline so retry cannot silently overwrite a competing answer.
      return { answers, baseAnswers, revision: saved.revision, conflict: true };
    }
  } catch {
    return null;
  }
}
