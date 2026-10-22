import test from "node:test";
import assert from "node:assert/strict";
import { restoreExamDraft } from "./draft";
import type { ExamView } from "./types";
const attempt: ExamView = {
  studentId: "A",
  name: "A",
  className: "8А",
  generation: 0,
  revision: 1,
  status: "active",
  deadline: new Date().toISOString(),
  departures: 0,
  questions: [],
  exercises: [],
  answers: { choices: { q01: 1 }, code: {} },
};
test("reloading after a lost acknowledgment preserves the latest conflicting draft and original baseline", () => {
  const baseAnswers = { choices: {}, code: {} };
  const answers = {
    choices: { q01: 2, q20: 3 },
    code: { c06: "console.log(99);" },
  };
  const restored = restoreExamDraft(
    attempt,
    JSON.stringify({ generation: 0, revision: 0, baseAnswers, answers }),
  );
  assert.deepEqual(restored, {
    answers,
    baseAnswers,
    revision: 0,
    conflict: true,
  });
  assert.equal(attempt.answers.choices.q01, 1);
});
test("draft reload merges different answers and rejects another generation or malformed draft", () => {
  const draft = {
    generation: 0,
    revision: 0,
    baseAnswers: { choices: {}, code: {} },
    answers: { choices: { q20: 3 }, code: { c01: "console.log(8);" } },
  };
  const restored = restoreExamDraft(attempt, JSON.stringify(draft));
  assert.deepEqual(restored?.answers, {
    choices: { q01: 1, q20: 3 },
    code: { c01: "console.log(8);" },
  });
  assert.equal(restored?.conflict, false);
  assert.equal(
    restoreExamDraft({ ...attempt, generation: 1 }, JSON.stringify(draft)),
    null,
  );
  assert.equal(restoreExamDraft(attempt, "bad json"), null);
});
