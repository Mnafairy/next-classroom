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
let loaded = false;
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
  if (!loaded) {
    loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) snapshot = sanitizeProgress(JSON.parse(raw));
    } catch {
      savingAvailable = false;
    }
  }
  return snapshot;
}
export const getServerProgress = () => initial;
export const canSave = () => savingAvailable;
export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      snapshot = event.newValue
        ? sanitizeProgress(JSON.parse(event.newValue))
        : initial;
    } catch {
      snapshot = initial;
    }
    listeners.forEach((callback) => callback());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function updateProgress(updater: (current: Progress) => Progress) {
  snapshot = updater(getProgress());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    savingAvailable = true;
  } catch {
    savingAvailable = false;
  }
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
