export type ExampleFile = {
  name: string;
  contents: string;
} & (
  | { mode: "javascript" }
  | { mode: "python"; inputs?: string }
  | { mode: "download" }
  | { mode: "read" }
);

type ExistingPractice = {
  summary: string;
  links: readonly { label: string; href: string }[];
};

type LessonContent = {
  objective: string;
  materials: string;
  example: { explanation: string; files?: readonly ExampleFile[] };
  practice: readonly [string, ...string[]];
  deliverable: string;
  criteria: readonly [string, ...string[]];
  check: { question: string; answer: string };
};

export type Lesson = {
  id: string;
  title: string;
  sourceRow: number;
  periods: number;
} & (
  | { coverage: "existing"; existing: ExistingPractice }
  | ({ coverage: "extended"; existing: ExistingPractice } & LessonContent)
  | ({ coverage: "new" } & LessonContent)
);

export type GradePlan = {
  grade: number;
  summary: string;
  pacing?: string;
  units: readonly {
    title: string;
    lessons: readonly [Lesson, ...Lesson[]];
  }[];
};
