import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  state,
  studentId,
  blank,
  selectStudent,
  signOutStudent,
  save,
  profileKey,
  normalizeStudentId,
  LEGACY_STORAGE_KEY,
  storageAvailable,
} from "../src/store.js";
class Storage {
  data = new Map();
  getItem(k) {
    return this.data.get(k) ?? null;
  }
  setItem(k, v) {
    this.data.set(k, String(v));
  }
  removeItem(k) {
    this.data.delete(k);
  }
}
beforeEach(() => {
  signOutStudent();
  globalThis.localStorage = new Storage();
});
test("a new student starts fresh and never inherits anonymous classroom work", () => {
  localStorage.setItem(
    LEGACY_STORAGE_KEY,
    JSON.stringify({
      ...blank(),
      completed: ["name"],
      drafts: { name: "another student code" },
      history: [{ correct: 20 }],
    }),
  );
  selectStudent("8A-001");
  assert.deepEqual(state, blank());
  assert.equal(studentId, "8A-001");
  assert.equal(localStorage.getItem(LEGACY_STORAGE_KEY), null);
});
test("different IDs isolate drafts, completion, solutions, quiz history, best scores and ongoing attempts", () => {
  selectStudent("8A-001");
  Object.assign(state, {
    drafts: { name: "student A" },
    completed: ["name"],
    assisted: ["grade"],
    history: [
      {
        title: "Хувьсагч",
        date: "2026-10-19T00:00:00.000Z",
        correct: 4,
        total: 5,
      },
    ],
    best: { variables: 80 },
    active: "grade",
    play: 'console.log("A");',
    attempt: {
      quiz: "variables",
      ids: ["v1"],
      answers: { v1: 1 },
      index: 0,
      started: 123,
    },
  });
  save();
  const snapshot = JSON.stringify(state);
  selectStudent("8A-002");
  assert.deepEqual(state, blank());
  state.drafts.name = "student B";
  state.best.variables = 20;
  save();
  selectStudent("8A-001");
  assert.equal(JSON.stringify(state), snapshot);
  selectStudent("8A-002");
  assert.equal(state.drafts.name, "student B");
  assert.equal(state.best.variables, 20);
});
test("switching student clears active state without deleting the former student profile", () => {
  selectStudent("001");
  state.completed.push("name");
  signOutStudent();
  assert.equal(studentId, "");
  assert.deepEqual(state, blank());
  assert.ok(localStorage.getItem(profileKey("001")));
  selectStudent("001");
  assert.deepEqual(state.completed, ["name"]);
});
test("a page starts without a persisted automatic identity; same ID restores after module reload", async () => {
  selectStudent("001");
  state.drafts.name = "saved code";
  save();
  const reloaded = await import("../src/store.js?new-page");
  assert.equal(reloaded.studentId, "");
  assert.deepEqual(reloaded.state, blank());
  reloaded.selectStudent("001");
  assert.equal(reloaded.state.drafts.name, "saved code");
});
test("ID normalization preserves leading zeros and handles case and pasted whitespace", () => {
  assert.equal(normalizeStudentId(" 8a-001 "), "8A-001");
  assert.equal(normalizeStudentId("00123"), "00123");
  assert.equal(profileKey("8a-001"), profileKey("8A-001"));
});
test("invalid IDs cannot switch or overwrite an active profile", () => {
  selectStudent("001");
  state.completed.push("name");
  for (const id of ["", " ", "a b", "../student", "<script>", "x".repeat(41)])
    assert.throws(() => selectStudent(id));
  assert.equal(studentId, "001");
  assert.deepEqual(state.completed, ["name"]);
});
test("prototype-like IDs are ordinary isolated storage keys", () => {
  selectStudent("toString");
  state.drafts.name = "A";
  save();
  selectStudent("constructor");
  assert.deepEqual(state, blank());
});
test("unavailable storage allows fresh work and reports that it cannot be saved", () => {
  globalThis.localStorage = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
    removeItem() {
      throw Error("blocked");
    },
  };
  selectStudent("001");
  assert.equal(storageAvailable, false);
  assert.equal(studentId, "001");
  assert.deepEqual(state, blank());
  assert.equal(save(), false);
});
test("malformed saved JSON cannot inherit the previously active student state", () => {
  selectStudent("A");
  state.completed = ["name"];
  save();
  localStorage.setItem(profileKey("B"), "bad json");
  selectStudent("B");
  assert.deepEqual(state, blank());
});

test("damaged or forged saved quiz values cannot crash the lesson or inject HTML", () => {
  localStorage.setItem(
    profileKey("SAFE"),
    JSON.stringify({
      drafts: { name: "keep code", unknown: "drop" },
      completed: ["name", "name", "unknown"],
      best: { all: "<img src=x onerror=alert(1)>", variables: 80 },
      history: [
        null,
        { title: "Injected", date: "today", correct: "<img>", total: 5 },
      ],
      attempt: {
        quiz: "missing",
        ids: ["missing"],
        index: 99,
        answers: {},
        started: 0,
      },
    }),
  );
  selectStudent("SAFE");
  assert.deepEqual(state.history, []);
  assert.deepEqual(state.best, { variables: 80 });
  assert.equal(state.attempt, null);
  assert.deepEqual(state.completed, ["name"]);
  assert.deepEqual(state.drafts, { name: "keep code" });
});
