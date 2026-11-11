import { isProgressSnapshot } from "../student/protocol";
import {
  exercises,
  findExercise,
  starterHtml,
  type ExerciseId,
  type Files,
} from "./lessons";

export { starterHtml } from "./lessons";
export type { Files } from "./lessons";
export const maxCodeLength = 20000;
export type Draft = { files: Files; viewedSolution: boolean };
export type Progress = {
  version: 2;
  active: ExerciseId;
  completed: ExerciseId[];
  drafts: Partial<Record<ExerciseId, Draft>>;
  playground: Files;
};
export const starterFiles: Files = {
  "index.html": starterHtml,
  "style.css": "",
};
export const initialProgress: Progress = {
  version: 2,
  active: exercises[0].id,
  completed: [],
  drafts: {},
  playground: starterFiles,
};

function readFiles(value: unknown, fallback = starterFiles): Files {
  if (!isProgressSnapshot(value)) return fallback;
  const html = value["index.html"];
  const css = value["style.css"];
  return {
    "index.html":
      typeof html === "string" && html.trim()
        ? html.slice(0, maxCodeLength)
        : fallback["index.html"],
    "style.css":
      typeof css === "string"
        ? css.slice(0, maxCodeLength)
        : fallback["style.css"],
  };
}

const legacySteps: Record<string, readonly ExerciseId[]> = {
  "html-tags": ["card-wrapper", "card-title", "card-description", "card-image"],
  "css-colors": ["card-background", "card-text-color", "card-font-size"],
  "box-model": ["card-padding", "card-border", "card-margin"],
  "card-layout": ["image-width"],
  "own-project": ["my-card", "my-card", "my-card"],
};

function migrateProgress(value: Record<string, unknown>): Progress {
  const drafts: Progress["drafts"] = {};
  const oldDrafts = isProgressSnapshot(value.drafts) ? value.drafts : {};
  const oldCompleted = Array.isArray(value.completed) ? value.completed : [];
  const completed = exercises
    .filter(({ topic }) => oldCompleted.includes(topic))
    .map(({ id }) => id);
  let active =
    exercises.find(({ topic }) => topic === value.active)?.id ??
    exercises[0].id;
  if (value.active === "card-layout") active = "image-width";
  for (const [topic, ids] of Object.entries(legacySteps)) {
    const draft = oldDrafts[topic];
    if (!isProgressSnapshot(draft) || !isProgressSnapshot(draft.files))
      continue;
    const step =
      typeof draft.step === "number" &&
      Number.isInteger(draft.step) &&
      draft.step >= 0
        ? draft.step
        : 0;
    const id = ids[Math.min(step, ids.length - 1)];
    drafts[id] = {
      files: readFiles(draft.files, findExercise(id).starter),
      viewedSolution: false,
    };
    if (value.active === topic) active = id;
  }
  return { version: 2, active, completed, drafts, playground: starterFiles };
}

export function readProgress(value: unknown): Progress {
  if (!isProgressSnapshot(value)) return initialProgress;
  if (value.version === 1) return migrateProgress(value);
  if (value.version !== 2) return initialProgress;
  const drafts: Progress["drafts"] = {};
  const saved = isProgressSnapshot(value.drafts) ? value.drafts : {};
  for (const exercise of exercises) {
    const draft = saved[exercise.id];
    if (!isProgressSnapshot(draft)) continue;
    drafts[exercise.id] = {
      files: readFiles(draft.files, exercise.starter),
      viewedSolution: draft.viewedSolution === true,
    };
  }
  const completed = Array.isArray(value.completed) ? value.completed : [];
  return {
    version: 2,
    active: findExercise(typeof value.active === "string" ? value.active : "")
      .id,
    completed: exercises
      .filter(({ id }) => completed.includes(id) && !drafts[id]?.viewedSolution)
      .map(({ id }) => id),
    drafts,
    playground: readFiles(value.playground),
  };
}

export function exerciseDraft(progress: Progress, id: ExerciseId): Draft {
  return (
    progress.drafts[id] ?? {
      files: findExercise(id).starter,
      viewedSolution: false,
    }
  );
}
