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

test("another tab's acknowledgment preserves this tab's offline draft and explicit recovery copy", async () => {
  const { JSDOM } = await import("jsdom");
  const { rememberDraft, tabDraft, alternateDrafts } =
    await import("./browser-drafts");
  const tabs = [
    new JSDOM("", { url: "https://school.test" }),
    new JSDOM("", { url: "https://school.test" }),
  ];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const select = (tab: number) =>
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: tabs[tab].window,
    });
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: tabs[0].window.localStorage,
    });
    select(1);
    const raw = JSON.stringify({
      revision: 1,
      generation: 0,
      baseAnswers: attempt.answers,
      answers: { choices: { q01: 3 }, code: {} },
    });
    rememberDraft(attempt, "tab-b", raw);
    select(0);
    rememberDraft(attempt, "tab-a", null);
    assert.equal(tabDraft(attempt), null);
    assert.deepEqual(alternateDrafts(attempt, null), [raw]);
    select(1);
    assert.equal(tabDraft(attempt), raw);
    assert.equal(
      restoreExamDraft(
        { ...attempt, revision: 2, answers: { choices: { q01: 0 }, code: {} } },
        raw,
      )?.answers.choices.q01,
      3,
    );
    assert.deepEqual(alternateDrafts({ ...attempt, generation: 1 }, null), []);
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (originalStorage)
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
    tabs.forEach((tab) => tab.window.close());
  }
});
