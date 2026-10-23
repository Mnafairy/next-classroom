export const courses = ["python", "javascript", "nextjs"] as const;
export type Course = (typeof courses)[number];
export function normalizeStudentId(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid student ID");
  const id = value.trim().normalize("NFKC").toUpperCase();
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._-]{0,39}$/u.test(id))
    throw new Error("Invalid student ID");
  return id;
}
