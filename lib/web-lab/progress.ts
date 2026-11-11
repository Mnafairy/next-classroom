import { isProgressSnapshot } from "../student/protocol";
import { grades, lessons, type Grade, type LessonId } from "./lessons";

export const maxCodeLength = 20000;
export const starterHtml = `<!doctype html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Миний карт · КодЛаб</title>
</head>
<body>
  <!-- Картаа энд бичээрэй. -->
</body>
</html>`;

export type Files = { "index.html": string; "style.css": string };
export type Draft = { files: Files; step: number };

export type Progress = {
  version: 1;
  grade: Grade;
  active: LessonId;
  completed: LessonId[];
  drafts: Partial<Record<LessonId, Draft>>;
};

export const starterDraft: Draft = {
  files: { "index.html": starterHtml, "style.css": "" },
  step: 0,
};

export const initialProgress: Progress = {
  version: 1,
  grade: 6,
  active: lessons[0].id,
  completed: [],
  drafts: {},
};

export function readProgress(value: unknown): Progress {
  if (!isProgressSnapshot(value) || value.version !== 1) return initialProgress;

  const drafts: Progress["drafts"] = {};
  if (isProgressSnapshot(value.drafts)) {
    for (const { id, steps } of lessons) {
      const draft = value.drafts[id];
      if (!isProgressSnapshot(draft) || !isProgressSnapshot(draft.files))
        continue;
      const html = draft.files["index.html"];
      const css = draft.files["style.css"];
      drafts[id] = {
        files: {
          "index.html":
            typeof html === "string" && html.trim()
              ? html.slice(0, maxCodeLength)
              : starterHtml,
          "style.css":
            typeof css === "string" ? css.slice(0, maxCodeLength) : "",
        },
        step:
          typeof draft.step === "number" &&
          Number.isInteger(draft.step) &&
          draft.step >= 0 &&
          draft.step < steps.length
            ? draft.step
            : 0,
      };
    }
  }

  const completed = Array.isArray(value.completed) ? value.completed : [];
  return {
    version: 1,
    grade:
      grades.find((grade) => grade === value.grade) ?? initialProgress.grade,
    active:
      lessons.find(({ id }) => id === value.active)?.id ??
      initialProgress.active,
    completed: lessons
      .filter(({ id }) => completed.includes(id))
      .map(({ id }) => id),
    drafts,
  };
}

export function startingDraft(progress: Progress, id: LessonId): Draft {
  if (id === "own-project") return starterDraft;
  const earlier = lessons.slice(
    0,
    lessons.findIndex((lesson) => lesson.id === id),
  );
  const previous = earlier.findLast((lesson) => progress.drafts[lesson.id]);
  const files = previous && progress.drafts[previous.id]?.files;
  return files ? { files, step: 0 } : starterDraft;
}

export function openLesson(progress: Progress, id: LessonId): Progress {
  const draft = progress.drafts[id] ?? startingDraft(progress, id);
  return {
    ...progress,
    active: id,
    drafts:
      draft === starterDraft
        ? progress.drafts
        : { ...progress.drafts, [id]: draft },
  };
}
