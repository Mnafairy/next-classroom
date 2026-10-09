export type Files = Record<string, string>;
export type CheckResult = { label: string; passed: boolean; detail?: string };
export type Question = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};
export type Blank = {
  token: string;
  label: string;
  answer: string;
  width?: number;
};
export type ButtonSnapshot = {
  text: string;
  background: string;
  color: string;
  padding: string;
};
export type RuntimeReport = {
  runId: string;
  buttons: ButtonSnapshot[];
  probes: ButtonSnapshot[][];
  cards?: CardSnapshot[];
  cardProbes?: CardSnapshot[][];
  initialInteraction?: InteractionSnapshot;
  interactions?: InteractionSnapshot[];
  buttonClickCalls?: number[];
  cardClickCalls?: number[];
  error?: string;
};
export type InteractionSnapshot = {
  alerts: string[];
  text: string;
  buttons: ButtonSnapshot[];
};
export type InteractionStep = {
  button: number;
  alerts?: string[];
  text?: string;
  labels?: string[];
};
export type CardSnapshot = {
  title: string;
  description: string;
  buttons: ButtonSnapshot[];
};
export type CardContent = {
  title: string;
  description: string;
  buttonLabel: string;
  color: string;
};
export type Exercise = {
  id: string;
  module: number;
  title: string;
  shortTitle: string;
  duration: string;
  eyebrow: string;
  paragraphs: string[];
  concept: { title: string; body: string };
  task: string;
  kind: "commands" | "quiz" | "code";
  example: string;
  exampleFile: string;
  starter: Files;
  solution: Files;
  blanks?: Blank[];
  questions?: Question[];
  hints: string[];
  expected?: { label: string; color: string }[];
  props?: "label" | "color";
  styled?: boolean;
  expectedCards?: CardContent[];
  cardProps?: boolean;
  activeFile?: string;
  interactions?: InteractionStep[];
  initialText?: string;
  forwardClick?: "button" | "card";
  clientFile?: string;
  stateFile?: string;
  checklist?: string[];
};
export type Module = {
  title: string;
  subtitle: string;
  icon: "terminal" | "layers" | "component" | "sliders";
};
export type Draft = {
  files: Files;
  answers: Record<string, string>;
  viewedSolution: boolean;
};
export type Progress = {
  version: number;
  active: string;
  completed: string[];
  drafts: Record<string, Draft>;
};
