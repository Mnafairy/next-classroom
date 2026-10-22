import {
  examFetch,
  ExamRevisionConflictError,
  ExamSessionExpiredError,
} from "./client";
import type { ExamAnswers } from "./protocol";
import type { ExamResponse, ExamView } from "./types";

export class ExamAnswerConflictError extends Error {
  constructor() {
    super(
      "Хариултын хадгалсан хувилбар зөрлөө. Энэ цонхны ажлыг татаж аваад багшдаа хандана уу.",
    );
  }
}

export function mergeExamAnswers(
  base: ExamAnswers,
  local: ExamAnswers,
  remote: ExamAnswers,
  preferLocal = false,
): ExamAnswers {
  function merge<T>(
    before: Record<string, T>,
    mine: Record<string, T>,
    saved: Record<string, T>,
  ) {
    const result = { ...saved };
    for (const key of new Set([...Object.keys(before), ...Object.keys(mine)])) {
      if (mine[key] === before[key]) continue;
      if (
        !preferLocal &&
        saved[key] !== before[key] &&
        saved[key] !== mine[key]
      )
        throw new ExamAnswerConflictError();
      if (mine[key] === undefined) delete result[key];
      else result[key] = mine[key];
    }
    return result;
  }
  return {
    choices: merge(base.choices, local.choices, remote.choices),
    code: merge(base.code, local.code, remote.code),
  };
}

export function sameExamAnswers(left: ExamAnswers, right: ExamAnswers) {
  return (["choices", "code"] as const).every((kind) => {
    const a = left[kind],
      b = right[kind];
    return (
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((key) => a[key] === b[key])
    );
  });
}

export async function saveExamAnswers(
  attempt: ExamView,
  answers: ExamAnswers,
  submit: boolean,
  writerId?: string,
): Promise<ExamResponse | null> {
  let current = attempt,
    pending = answers;
  let refreshed: ExamResponse | null = null;
  for (let retry = 0; retry < 3; retry++) {
    if (!submit && sameExamAnswers(current.answers, pending)) return refreshed;
    try {
      return await (
        await examFetch({
          action: submit ? "submit" : "save",
          revision: current.revision,
          studentId: current.studentId,
          generation: current.generation,
          baseAnswers: current.answers,
          ...(writerId ? { writerId } : {}),
          ...pending,
        })
      ).json();
    } catch (error) {
      if (!(error instanceof ExamRevisionConflictError)) throw error;
      const latest: ExamResponse = await (await examFetch()).json();
      if (
        !latest.attempt ||
        latest.attempt.studentId !== attempt.studentId ||
        latest.attempt.generation !== attempt.generation
      )
        throw new ExamSessionExpiredError(
          "Шалгалтын нэвтрэлт өөрчлөгдсөн. ID-гаар дахин нэвтэрнэ үү.",
        );
      if (latest.attempt.status !== "active")
        throw new Error(
          "Шалгалт дууссан байна. Энэ цонхны хадгалаагүй ажлыг татаж аваад багшдаа хандана уу.",
        );
      pending = mergeExamAnswers(
        current.answers,
        pending,
        latest.attempt.answers,
      );
      current = latest.attempt;
      refreshed = latest;
    }
  }
  throw new Error(
    "Хадгалалт давхацлаа. Бусад шалгалтын табаа хаагаад дахин хадгална уу. Энэ цонхны хариулт хэвээр байна.",
  );
}
