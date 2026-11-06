import test from "node:test";
import assert from "node:assert/strict";
import { gradePlans } from "./index";
import { lessonPractice, practiceQuestions } from "./practice";
import {
  emptyQuiz,
  quizFeedback,
  restoreQuiz,
  selectQuestions,
  type QuizAttempt,
} from "./practice/quiz";
import { restoreExercises } from "./practice/drafts";

function random(seed = 123) {
  let n = seed;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}

test("every source lesson, including reused lessons, has six distinct tasks and two explained questions", () => {
  let tasks = 0,
    questions = 0;
  for (const plan of gradePlans) {
    const bank = practiceQuestions(plan.grade);
    const lessons = plan.units.flatMap((unit) => unit.lessons);
    assert.equal(bank.length, lessons.length * 2);
    assert.equal(new Set(bank.map((q) => q.id)).size, bank.length);
    for (const lesson of lessons) {
      const pack = lessonPractice(plan.grade, lesson.id);
      assert.equal(pack.tasks.length, 6);
      assert.equal(new Set(pack.tasks).size, 6);
      assert.ok(
        pack.tasks.every((task) => task.trim().length > 0),
        lesson.id,
      );
      assert.ok(pack.hint.trim().length > 0);
      tasks += pack.tasks.length;
    }
    for (const question of bank) {
      assert.equal(new Set(question.choices).size, 3, question.id);
      assert.ok(question.explanation.trim().length > 0, question.id);
      assert.ok(lessons.some((l) => l.id === question.lessonId));
      questions++;
    }
  }
  assert.equal(tasks, 498);
  assert.equal(questions, 166);
});

test("mixed tests represent all units, contain no duplicates, and prefer unused questions on retake", () => {
  for (const plan of gradePlans) {
    const bank = practiceQuestions(plan.grade);
    const first = selectQuestions(bank, 12, [], random(31));
    const next = selectQuestions(
      bank,
      12,
      first.map((item) => item.id),
      random(32),
    );
    for (const items of [first, next]) {
      assert.equal(items.length, 12);
      assert.equal(new Set(items.map((q) => q.id)).size, 12);
      assert.equal(
        new Set(items.map((item) => bank.find((q) => q.id === item.id)!.unit))
          .size,
        plan.units.length,
      );
      for (const item of items)
        assert.deepEqual([...item.order].sort(), [0, 1, 2]);
    }
    assert.ok(next.every((item) => !first.some((old) => old.id === item.id)));
  }
});

test("scoped tests stay inside their lesson and handle exhausted or empty banks", () => {
  const bank = practiceQuestions(7).filter((q) => q.lessonId === "for-loops");
  const selected = selectQuestions(
    bank,
    12,
    bank.map((q) => q.id),
    random(),
  );
  assert.equal(selected.length, 2);
  assert.ok(selected.every((q) => bank.some((source) => source.id === q.id)));
  assert.deepEqual(selectQuestions([], 12), []);
});

test("grading uses choice identity after shuffling and reports the exact missed lesson", () => {
  const bank = practiceQuestions(10);
  const items = selectQuestions(bank, 12, [], random(77));
  assert.ok(items.some((item) => item.order[0] !== 0));
  const attempt: QuizAttempt = {
    items,
    answers: Object.fromEntries(items.map((q) => [q.id, 0])),
    submitted: false,
    label: "Test",
  };
  assert.equal(quizFeedback(attempt, bank).percent, 100);
  assert.equal(quizFeedback(attempt, bank).complete, true);
  attempt.answers[items[0].id] = 2;
  const result = quizFeedback(attempt, bank);
  assert.equal(result.correct, 11);
  assert.deepEqual(result.reviewLessons, [
    bank.find((q) => q.id === items[0].id)!.lessonId,
  ]);
  delete attempt.answers[items[1].id];
  assert.equal(quizFeedback(attempt, bank).complete, false);
});

test("saved attempts restore answer positions, reject foreign questions and incomplete submitted results", () => {
  const bank = practiceQuestions(8);
  const items = selectQuestions(bank, 12, [], random());
  const state = {
    ...emptyQuiz,
    rounds: 1,
    seen: items.map((q) => q.id),
    attempt: {
      items,
      answers: { [items[0].id]: 1 },
      label: "Сорилт",
      submitted: false,
    },
  };
  assert.deepEqual(restoreQuiz(JSON.parse(JSON.stringify(state)), bank), state);
  assert.equal(restoreQuiz(state, practiceQuestions(11)), null);
  assert.equal(
    restoreQuiz(
      { ...state, attempt: { ...state.attempt, submitted: true } },
      bank,
    ),
    null,
  );
  assert.equal(
    restoreQuiz(
      { ...state, attempt: { ...state.attempt, items: [items[0], items[0]] } },
      bank,
    ),
    null,
  );
  assert.equal(
    restoreQuiz(
      {
        ...state,
        attempt: {
          ...state.attempt,
          items: [{ ...items[0], order: [0, 0, 2] }],
        },
      },
      bank,
    ),
    null,
  );
  assert.equal(
    restoreQuiz(
      {
        ...state,
        attempt: { ...state.attempt, answers: { [items[0].id]: 9 } },
      },
      bank,
    ),
    null,
  );
  assert.equal(restoreQuiz("bad data", bank), null);
});

test("exercise draft validates completion and note boundaries without losing valid work", () => {
  const draft = {
    selected: 4,
    completed: [0, 1, 1],
    notes: { 4: "Оролт → үр дүн" },
    extension: 12,
  };
  assert.deepEqual(restoreExercises(draft), { ...draft, completed: [0, 1] });
  assert.equal(restoreExercises({ ...draft, completed: [6] }), null);
  assert.equal(restoreExercises({ ...draft, notes: { 0: 42 } }), null);
  assert.equal(restoreExercises({ ...draft, selected: -1 }), null);
  assert.equal(restoreExercises(null), null);
});
