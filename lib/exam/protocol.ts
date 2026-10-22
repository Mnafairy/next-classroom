import { examExercises, examQuestions } from "./content";
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
      value.length > 12000
    )
      throw new Error("Кодын хэмжээ эсвэл дасгалын ID буруу байна.");
    code[id] = value;
  }
  return { choices, code };
}
