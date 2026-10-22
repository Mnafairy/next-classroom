import { createCloudProgress, messages } from "../student/cloud";
import { normalizeStudentId } from "../student/identity";
import { BUTTON, exercises, findExercise, initialExercise } from "./lessons";
import type { Draft, Exercise, Progress } from "./types";

export const STORAGE_KEY = "next-classroom:progress:v1";
const initial: Progress = {
  version: 1,
  active: initialExercise.id,
  completed: [],
  drafts: {},
};
let snapshot = initial;
let studentId = "";
let cloudStatus = "";
let statusVersion = 0;
const cloud = createCloudProgress("nextjs", (status) => {
  cloudStatus = messages[status];
  statusVersion++;
  listeners.forEach((listener) => listener());
});
export const recoverCloudProgress = () => cloud.recover();
export const getCloudVersion = () => statusVersion;
export const getCloudStatus = () => cloudStatus;
const studentKey = () => `${STORAGE_KEY}:${studentId}`;
export async function loginStudent(value: string) {
  const id = normalizeStudentId(value);
  let local = initial;
  try {
    local = sanitizeProgress(
      JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${id}`) || "null"),
    );
  } catch {}
  const remote = await cloud.load(id, local);
  studentId = id;
  snapshot = sanitizeProgress(remote);
  listeners.forEach((listener) => listener());
  return id;
}
export function logoutStudent() {
  cloud.stop();
  studentId = "";
  snapshot = initial;
  listeners.forEach((listener) => listener());
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void cloud.flush());
  window.addEventListener("online", () => void cloud.flush());
}
let savingAvailable = true;
const listeners = new Set<() => void>();

export function sanitizeProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") return initial;
  const data = value as Partial<Progress>;
  if (data.version !== 1) return initial;
  const drafts: Progress["drafts"] = {};
  for (const exercise of exercises) {
    const draft = data.drafts?.[exercise.id];
    if (!draft || typeof draft !== "object") continue;
    const files: Draft["files"] = {};
    for (const path of Object.keys(exercise.starter)) {
      const code = draft.files?.[path];
      files[path] =
        typeof code === "string" && code.length <= 30000
          ? code
          : exercise.starter[path];
    }
    // Remove the old lesson-provided annotations without clearing student edits.
    if (exercise.module === 3 && files[BUTTON]) {
      files[BUTTON] = files[BUTTON].replace(
        /type ButtonProps = \{\s*label: string;\s*(?:color: string;\s*)?\};\s*/g,
        "",
      ).replace(/\}: ButtonProps\)/g, "})");
    }
    const answers: Draft["answers"] = {};
    for (const [key, answer] of Object.entries(draft.answers ?? {})) {
      if (typeof answer === "string" && answer.length < 200)
        answers[key] = answer;
    }
    drafts[exercise.id] = {
      files,
      answers,
      viewedSolution: draft.viewedSolution === true,
    };
  }
  return {
    version: 1,
    active:
      typeof data.active === "string" && findExercise(data.active)
        ? data.active
        : initial.active,
    completed: Array.isArray(data.completed)
      ? [
          ...new Set(
            data.completed.filter(
              (id) => typeof id === "string" && findExercise(id),
            ),
          ),
        ]
      : [],
    drafts,
  };
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return initial;
  if (!studentId) return initial;
  return snapshot;
}
export const getServerProgress = () => initial;
export const canSave = () => savingAvailable;
export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function updateProgress(updater: (current: Progress) => Progress) {
  if (!studentId) return;
  snapshot = updater(getProgress());
  try {
    localStorage.setItem(studentKey(), JSON.stringify(snapshot));
    savingAvailable = true;
  } catch {
    savingAvailable = false;
  }
  cloud.save(snapshot);
  listeners.forEach((listener) => listener());
}
export function getDraft(progress: Progress, exercise: Exercise): Draft {
  return (
    progress.drafts[exercise.id] ?? {
      files: { ...exercise.starter },
      answers: {},
      viewedSolution: false,
    }
  );
}
