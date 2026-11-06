import { gradePlans, lessonHref } from "..";
import { practice7 } from "./grade-7";
import { practice8 } from "./grade-8";
import { practice10 } from "./grade-10";
import { practice11 } from "./grade-11";
import type { PracticePack } from "./types";
import type { PracticeQuestion } from "./quiz";

const banks: Record<number, Record<string, PracticePack>> = {
  7: practice7,
  8: practice8,
  10: practice10,
  11: practice11,
};

export function lessonPractice(grade: number, lesson: string): PracticePack {
  const pack = banks[grade]?.[lesson];
  if (!pack) throw new Error(`Missing practice for ${grade}/${lesson}`);
  return pack;
}

export function practiceQuestions(grade: number): PracticeQuestion[] {
  const plan = gradePlans.find((entry) => entry.grade === grade);
  if (!plan) return [];
  return plan.units.flatMap((unit, unitIndex) =>
    unit.lessons.flatMap((lesson) =>
      lessonPractice(grade, lesson.id).questions.map((question, index) => ({
        ...question,
        id: `${grade}/${lesson.id}/${index + 1}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        href: lessonHref(grade, lesson.id),
        unit: unitIndex,
        unitTitle: unit.title,
      })),
    ),
  );
}

const localLessons: Record<number, readonly string[]> = {
  7: [
    "html-form",
    "flexbox",
    "dom-list",
    "todo",
    "iterative-app",
    "registration-project",
    "web-capstone",
  ],
  8: [
    "events-gradebook",
    "form-validation",
    "responsive-grid",
    "local-storage",
    "notes-app",
    "capstone",
  ],
};

export function practiceLanguage(grade: number, lesson: string) {
  if (grade === 11 || localLessons[grade]?.includes(lesson)) return "local";
  return grade === 10 ? "python" : "javascript";
}

export function practiceTestHref(grade: number, lesson?: string) {
  return `/practice-tests/${grade}${lesson ? `?lesson=${encodeURIComponent(lesson)}` : ""}`;
}
