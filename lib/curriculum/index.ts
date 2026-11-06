import { grade7 } from "./grade-7";
import { grade8 } from "./grade-8";
import { grade10 } from "./grade-10";
import { grade11 } from "./grade-11";
import type { GradePlan, Lesson } from "./types";

export const gradePlans: readonly GradePlan[] = [
  grade7,
  grade8,
  grade10,
  grade11,
];

export const coverageLabel = {
  existing: "Бэлэн дадлага",
  extended: "Нэмэлт хичээл",
  new: "Шинэ хичээл",
} satisfies Record<Lesson["coverage"], string>;

export function findGrade(grade: string) {
  return gradePlans.find((plan) => String(plan.grade) === grade);
}

export function gradeHref(grade: number) {
  return `/curriculum/${grade}`;
}

export function lessonHref(grade: number, id: string) {
  return `${gradeHref(grade)}/${id}`;
}
