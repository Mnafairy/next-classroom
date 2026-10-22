export type Requirement = {
  kind: "node" | "call" | "assign" | "nested";
  name: string;
  label: string;
};

export type TestCase = {
  label: string;
  inputs?: string[];
  variables?: Record<string, string | number | boolean>;
  expected: string;
};

export type PythonExercise = {
  id: string;
  module: number;
  title: string;
  minutes: number;
  level: "Эхлэл" | "Дадлага" | "Сорилт";
  steps: string[];
  starter: string;
  solution: string;
  inputs?: string[];
  exampleInput: string;
  expected: string;
  hints: string[];
  requirements: Requirement[];
  tests: TestCase[];
};

export type CourseModule = {
  title: string;
  description: string;
  symbol: string;
  color: string;
  fresh?: boolean;
  explanation: string;
  example: string;
};

export type QuizQuestion = {
  id: string;
  module: number;
  prompt: string;
  code?: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type PythonCheck = {
  label: string;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
};

export type RunResult = {
  output: string;
  error?: string;
  checks: PythonCheck[];
};

export type StudentProgress = {
  version: 1;
  active: string;
  drafts: Record<
    string,
    { code: string; inputs: string; solutionViewed: boolean }
  >;
  completed: string[];
  quizAttempts: Record<
    string,
    { answers: Record<string, number>; submitted: boolean }
  >;
  playground: { code: string; inputs: string };
};
