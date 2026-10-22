import { exercises, findExercise } from "./course";
import type { StudentProgress } from "./types";

export const SESSION_KEY = "python-lab:student:v1";
export const storageKey = (id: string) => `python-lab:progress:v1:${id}`;
export const normalizeStudent = (value: string) =>
  value.trim().normalize("NFKC").toUpperCase();
export const validStudent = (value: string) =>
  /^[\p{L}\p{N}][\p{L}\p{N}_-]{1,23}$/u.test(value);

export function emptyProgress(): StudentProgress {
  return {
    version: 1,
    active: exercises[0].id,
    completed: [],
    drafts: {},
    quizAttempts: {},
    playground: {
      code: '# Өөрийн санааг Python-оор туршаарай.\nprint("Сайн уу, Python!")\n',
      inputs: "",
    },
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function restoreProgress(raw: string | null): StudentProgress {
  const clean = emptyProgress();
  if (!raw) return clean;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1) return clean;
    if (typeof data.active === "string" && findExercise(data.active))
      clean.active = data.active;
    if (record(data.drafts)) {
      for (const [id, draft] of Object.entries(data.drafts)) {
        if (
          findExercise(id) &&
          record(draft) &&
          typeof draft.code === "string" &&
          draft.code.length <= 50000
        ) {
          clean.drafts[id] = {
            code: draft.code,
            inputs:
              typeof draft.inputs === "string"
                ? draft.inputs.slice(0, 10000)
                : "",
            solutionViewed: draft.solutionViewed === true,
          };
        }
      }
    }
    if (Array.isArray(data.completed))
      clean.completed = [
        ...new Set(
          data.completed.filter(
            (id): id is string =>
              typeof id === "string" &&
              !!findExercise(id) &&
              !clean.drafts[id]?.solutionViewed,
          ),
        ),
      ];
    if (record(data.playground) && typeof data.playground.code === "string")
      clean.playground = {
        code: data.playground.code.slice(0, 50000),
        inputs:
          typeof data.playground.inputs === "string"
            ? data.playground.inputs.slice(0, 10000)
            : "",
      };
    if (record(data.quizAttempts)) {
      for (const [id, attempt] of Object.entries(data.quizAttempts)) {
        if (
          !/^(all|[0-6])$/.test(id) ||
          !record(attempt) ||
          !record(attempt.answers)
        )
          continue;
        const answers: Record<string, number> = {};
        for (const [question, answer] of Object.entries(attempt.answers))
          if (
            Number.isInteger(answer) &&
            Number(answer) >= 0 &&
            Number(answer) <= 3
          )
            answers[question] = Number(answer);
        clean.quizAttempts[id] = {
          answers,
          submitted: attempt.submitted === true,
        };
      }
    }
    return clean;
  } catch {
    return clean;
  }
}
