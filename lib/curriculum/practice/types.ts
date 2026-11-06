export type QuestionSeed = {
  prompt: string;
  choices: readonly [string, string, string];
  explanation: string;
  code?: string;
};

export type PracticePack = {
  hint: string;
  tasks: readonly [string, string, string, string, string, string];
  questions: readonly [QuestionSeed, QuestionSeed];
};

// Author the correct answer first; the test runner gives each choice a stable
// identity before shuffling it. Display positions never determine correctness.
export function q(
  prompt: string,
  correct: string,
  alternative: string,
  other: string,
  explanation: string,
  code?: string,
): QuestionSeed {
  return { prompt, choices: [correct, alternative, other], explanation, code };
}

export function p(
  hint: string,
  tasks: PracticePack["tasks"],
  questions: PracticePack["questions"],
): PracticePack {
  return { hint, tasks, questions };
}
