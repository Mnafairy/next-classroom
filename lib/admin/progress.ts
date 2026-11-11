import {
  exercises as pythonExercises,
  modules as pythonModules,
} from "../python/course";
import { questions as pythonQuestions } from "../python/questions";
import { exercises as nextExercises } from "../course/lessons";
import { exercises as jsExercises } from "../../apps/kodlab/src/content.js";
import type { Course } from "../student/identity";
import { lessons as webLessons } from "../web-lab/lessons";
import type { CourseSummary, StudentDetail } from "./types";

export const catalog: Record<Course, { id: string; title: string }[]> = {
  python: pythonExercises.map(({ id, title }) => ({ id, title })),
  javascript: jsExercises.map(
    ({ id, title }: { id: string; title: string }) => ({ id, title }),
  ),
  nextjs: nextExercises.map(({ id, title }) => ({ id, title })),
  htmlcss: webLessons.map(({ id, title }) => ({ id, title })),
};
export const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown, limit = 50000) =>
  typeof value === "string" ? value.slice(0, limit) : "";
export function parseProgress(json: string): Record<string, unknown> {
  try {
    return object(JSON.parse(json));
  } catch {
    return {};
  }
}
function states(course: Course, value: unknown) {
  const data = object(value),
    drafts = object(data.drafts);
  const ids = new Set(catalog[course].map((e) => e.id));
  const assisted = new Set<string>();
  if (course === "javascript" && Array.isArray(data.assisted))
    for (const id of data.assisted)
      if (typeof id === "string" && ids.has(id)) assisted.add(id);
  for (const [id, value] of Object.entries(drafts))
    if (
      ids.has(id) &&
      (object(value).solutionViewed === true ||
        object(value).viewedSolution === true)
    )
      assisted.add(id);
  const completed = new Set(
    Array.isArray(data.completed)
      ? data.completed.filter(
          (id): id is string =>
            typeof id === "string" && ids.has(id) && !assisted.has(id),
        )
      : [],
  );
  const attempted = new Set(Object.keys(drafts).filter((id) => ids.has(id)));
  return { data, drafts, completed, assisted, attempted };
}
export function summarize(course: Course, value: unknown): CourseSummary {
  const { data, completed, assisted, attempted } = states(course, value);
  const quizzes: CourseSummary["quizzes"] = [];
  if (course === "python") {
    for (const [id, value] of Object.entries(object(data.quizAttempts))) {
      const attempt = object(value);
      if (attempt.submitted !== true) continue;
      const questions =
        id === "all"
          ? pythonQuestions
          : pythonQuestions.filter((q) => String(q.module) === id);
      if (!questions.length) continue;
      const answers = object(attempt.answers);
      quizzes.push({
        title:
          id === "all"
            ? "Нэгдсэн сорил"
            : pythonModules[Number(id)]?.title || "Сорил",
        correct: questions.filter((q) => answers[q.id] === q.answer).length,
        total: questions.length,
      });
    }
  }
  if (course === "javascript" && Array.isArray(data.history)) {
    for (const value of data.history.slice(0, 30)) {
      const item = object(value);
      if (
        Number.isInteger(item.correct) &&
        Number.isInteger(item.total) &&
        Number(item.total) > 0 &&
        Number(item.total) <= 100 &&
        Number(item.correct) >= 0 &&
        Number(item.correct) <= Number(item.total)
      )
        quizzes.push({
          title: text(item.title, 120) || "Сорил",
          correct: Number(item.correct),
          total: Number(item.total),
        });
    }
  }
  return {
    completed: completed.size,
    total: catalog[course].length,
    assisted: assisted.size,
    attempted: attempted.size,
    active: catalog[course].find((e) => e.id === data.active)?.title || "",
    quizzes,
  };
}
export function detail(
  course: Course,
  value: unknown,
  exerciseId?: string,
): Omit<StudentDetail, "updatedAt"> {
  const { data, drafts, completed, assisted, attempted } = states(
    course,
    value,
  );
  const exercises = catalog[course].map((e) => ({
    ...e,
    status: completed.has(e.id)
      ? ("complete" as const)
      : assisted.has(e.id)
        ? ("assisted" as const)
        : attempted.has(e.id)
          ? ("started" as const)
          : ("empty" as const),
  }));
  if (course === "python" || course === "javascript") {
    const hasPlay =
      course === "python"
        ? typeof object(data.playground).code === "string"
        : typeof data.play === "string";
    exercises.push({
      id: "__playground",
      title: "Чөлөөт код",
      status: hasPlay ? "started" : "empty",
    });
  }
  const selected =
    exercises.find((e) => e.id === (exerciseId || data.active)) || exercises[0];
  const draft = drafts[selected.id];
  const files: Record<string, string> = {},
    answers: Record<string, string> = {};
  if (selected.id === "__playground") {
    const code = course === "python" ? object(data.playground).code : data.play;
    if (typeof code === "string")
      files[course === "python" ? "playground.py" : "playground.js"] =
        text(code);
  } else if (course === "javascript" && typeof draft === "string")
    files["exercise.js"] = text(draft);
  else if (course === "python" && typeof object(draft).code === "string") {
    files["exercise.py"] = text(object(draft).code);
    if (object(draft).inputs)
      files["Оролт.txt"] = text(object(draft).inputs, 10000);
  } else if (course === "nextjs" || course === "htmlcss") {
    for (const [name, value] of Object.entries(
      object(object(draft).files),
    ).slice(0, 12))
      if (typeof value === "string") files[name.slice(0, 180)] = text(value);
    for (const [key, value] of Object.entries(
      object(object(draft).answers),
    ).slice(0, 100))
      if (typeof value === "string")
        answers[key.slice(0, 120)] = text(value, 1000);
  }
  return {
    course,
    summary: summarize(course, value),
    exercises,
    selected: { id: selected.id, title: selected.title, files, answers },
  };
}
