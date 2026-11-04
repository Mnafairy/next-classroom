import { examExercises, examQuestions } from "./content";
export const MAX_CODE_UNITS = 12000;
// Two full snapshots. A UTF-16 code unit can occupy six JSON bytes (e.g. a control character).
export const EXAM_REQUEST_BYTES =
  16 * 1024 + 2 * examExercises.length * MAX_CODE_UNITS * 6;
export function hasCodeAnswer(starter: string, code: string | undefined) {
  return !!code?.trim() && code.trim() !== starter.trim();
}
export type ExamAnswers = {
  choices: Record<string, number>;
  code: Record<string, string>;
};
export function parseAnswers(body: Record<string, unknown>): ExamAnswers {
  const choices: Record<string, number> = {},
    code: Record<string, string> = {};
  if (
    !body.choices ||
    typeof body.choices !== "object" ||
    Array.isArray(body.choices) ||
    !body.code ||
    typeof body.code !== "object" ||
    Array.isArray(body.code)
  )
    throw new Error("Хариултын бүтэц буруу байна.");
  for (const [id, value] of Object.entries(body.choices)) {
    if (
      !examQuestions.some((q) => q.id === id) ||
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 3
    )
      throw new Error("Тестийн хариулт буруу байна.");
    choices[id] = value;
  }
  for (const [id, value] of Object.entries(body.code)) {
    if (
      !examExercises.some((e) => e.id === id) ||
      typeof value !== "string" ||
      value.length > MAX_CODE_UNITS
    )
      throw new Error("Кодын хэмжээ эсвэл дасгалын ID буруу байна.");
    code[id] = value;
  }
  return { choices, code };
}
