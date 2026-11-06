import type { QuestionSeed } from "./types";

export type PracticeQuestion = QuestionSeed & {
  id: string;
  lessonId: string;
  lessonTitle: string;
  href: string;
  unit: number;
  unitTitle: string;
};

export type QuizItem = { id: string; order: number[] };
export type QuizAttempt = {
  items: QuizItem[];
  answers: Record<string, number>;
  submitted: boolean;
  label: string;
};
export type QuizState = {
  attempt: QuizAttempt | null;
  seen: string[];
  rounds: number;
};
export const emptyQuiz: QuizState = { attempt: null, seen: [], rounds: 0 };

export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectQuestions(
  bank: readonly PracticeQuestion[],
  count = 12,
  seen: readonly string[] = [],
  random = Math.random,
): QuizItem[] {
  const visited = new Set(seen);
  const chosen = new Set<string>();
  const lessons = new Set<string>();
  const units = shuffle([...new Set(bank.map((q) => q.unit))], random);
  const pool = shuffle(bank, random);
  const selected: QuizItem[] = [];
  // Round-robin units to represent the whole selected scope. Prefer unseen
  // questions, and different lessons whenever the remaining pool permits it.
  while (selected.length < Math.min(count, bank.length)) {
    for (const unit of units) {
      const available = pool.filter(
        (q) => q.unit === unit && !chosen.has(q.id),
      );
      const question =
        available.find((q) => !visited.has(q.id) && !lessons.has(q.lessonId)) ??
        available.find((q) => !visited.has(q.id)) ??
        available.find((q) => !lessons.has(q.lessonId)) ??
        available[0];
      if (!question) continue;
      chosen.add(question.id);
      lessons.add(question.lessonId);
      selected.push({ id: question.id, order: shuffle([0, 1, 2], random) });
      if (selected.length >= count) break;
    }
  }
  return selected;
}

export function quizFeedback(
  attempt: QuizAttempt,
  bank: readonly PracticeQuestion[],
) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const items = attempt.items.map((item) => {
    const question = byId.get(item.id);
    if (!question) throw new Error("Unknown practice question");
    const answer = attempt.answers[item.id];
    return {
      question,
      answer,
      correct: answer === 0,
      answered: [0, 1, 2].includes(answer),
    };
  });
  const correct = items.filter((item) => item.correct).length;
  return {
    items,
    correct,
    total: items.length,
    complete: items.length > 0 && items.every((item) => item.answered),
    percent: items.length ? Math.round((correct / items.length) * 100) : 0,
    reviewLessons: [
      ...new Set(
        items
          .filter((item) => !item.correct)
          .map((item) => item.question.lessonId),
      ),
    ],
  };
}

export function restoreQuiz(
  raw: unknown,
  bank: readonly PracticeQuestion[],
): QuizState | null {
  if (!raw || typeof raw !== "object") return null;
  const state = raw as Partial<QuizState>;
  const ids = new Set(bank.map((q) => q.id));
  if (
    !Array.isArray(state.seen) ||
    !state.seen.every((id) => typeof id === "string" && ids.has(id))
  )
    return null;
  if (!Number.isInteger(state.rounds) || state.rounds! < 0) return null;
  if (state.attempt === null)
    return {
      attempt: null,
      seen: [...new Set(state.seen)],
      rounds: state.rounds!,
    };
  const a = state.attempt;
  if (
    !a ||
    !Array.isArray(a.items) ||
    !a.items.length ||
    a.items.length > 12 ||
    typeof a.label !== "string" ||
    a.label.length > 200 ||
    typeof a.submitted !== "boolean" ||
    !a.answers ||
    typeof a.answers !== "object"
  )
    return null;
  if (
    a.items.some(
      (item) =>
        !item ||
        !ids.has(item.id) ||
        !Array.isArray(item.order) ||
        item.order.length !== 3 ||
        new Set(item.order).size !== 3 ||
        !item.order.every((n) => [0, 1, 2].includes(n)),
    )
  )
    return null;
  const itemIds = new Set(a.items.map((item) => item.id));
  if (
    itemIds.size !== a.items.length ||
    Object.entries(a.answers).some(
      ([id, answer]) => !itemIds.has(id) || ![0, 1, 2].includes(answer),
    )
  )
    return null;
  if (a.submitted && !quizFeedback(a, bank).complete) return null;
  return { attempt: a, seen: [...new Set(state.seen)], rounds: state.rounds! };
}
