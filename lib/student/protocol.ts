import { courses, normalizeStudentId, type Course } from "./identity";

export type ProgressSnapshot = Record<string, unknown>;
export type ProgressRequest = {
  studentId: string;
  course: Course;
} & (
  | { action: "load" }
  | { action: "save"; revision: number; progress: ProgressSnapshot }
);

export const isProgressSnapshot = (value: unknown): value is ProgressSnapshot =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function parseProgressRequest(
  input: Record<string, unknown>,
): ProgressRequest {
  const course = courses.find((course) => course === input.course);
  if (!course) throw new Error("Invalid course");
  const studentId = normalizeStudentId(input.studentId);
  if (input.action === "load") return { action: "load", course, studentId };
  if (
    input.action !== "save" ||
    typeof input.revision !== "number" ||
    !Number.isSafeInteger(input.revision) ||
    input.revision < 0 ||
    !isProgressSnapshot(input.progress)
  )
    throw new Error("Invalid progress");
  return {
    action: "save",
    course,
    studentId,
    revision: input.revision,
    progress: input.progress,
  };
}
