export const courses = ["python", "javascript", "nextjs", "htmlcss"] as const;
export type Course = (typeof courses)[number];
export const MAX_TEACHER_NAME_LENGTH = 201;

export function normalizeTeacherName(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_TEACHER_NAME_LENGTH)
    return null;
  const name = value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLowerCase();
  return /^\p{L}[\p{L}\p{M} .'’-]*$/u.test(name) ? name : null;
}

export function normalizeStudentId(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid student ID");
  const id = value.trim().normalize("NFKC").toUpperCase();
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._-]{0,39}$/u.test(id))
    throw new Error("Invalid student ID");
  return id;
}
