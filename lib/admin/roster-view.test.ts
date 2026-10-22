import test from "node:test";
import assert from "node:assert/strict";
import { rosterView } from "./roster-view";
import type { StudentRow } from "./types";
const rows: StudentRow[] = [
  {
    id: "001",
    name: "First",
    groupId: "a",
    notes: "",
    updatedAt: null,
    courses: {},
  },
  {
    id: "002",
    name: "Second",
    groupId: "a",
    notes: "",
    updatedAt: "2026-10-20T01:00:00Z",
    courses: {
      javascript: {
        completed: 1,
        total: 2,
        attempted: 1,
        assisted: 0,
        active: "",
        quizzes: [],
      },
    },
  },
  {
    id: "003",
    name: "Third",
    groupId: "b",
    notes: "",
    updatedAt: "2026-10-20T02:00:00Z",
    courses: {
      python: {
        completed: 2,
        total: 2,
        attempted: 2,
        assisted: 0,
        active: "",
        quizzes: [],
      },
    },
  },
];
const options = {
  group: "all",
  query: "",
  course: "all",
  status: "all",
  sort: "recent",
} as const;
test("teacher roster counts follow class and course; unsaved students remain visible", () => {
  const result = rosterView(rows, { ...options, group: "a", course: "python" });
  assert.equal(result.filtered.length, 2);
  assert.deepEqual(result.counts, {
    all: 2,
    working: 0,
    "not-started": 2,
    complete: 0,
  });
  assert.deepEqual(
    rosterView(rows, { ...options, status: "complete" }).filtered.map(
      (s) => s.id,
    ),
    ["003"],
  );
});
test("recent work comes first; name search and progress sorting use actual rows", () => {
  assert.deepEqual(
    rosterView(rows, options).filtered.map((s) => s.id),
    ["003", "002", "001"],
  );
  assert.deepEqual(
    rosterView(rows, { ...options, query: "second" }).filtered.map((s) => s.id),
    ["002"],
  );
  assert.equal(
    rosterView(rows, { ...options, sort: "progress" }).filtered[0].id,
    "003",
  );
  assert.equal(
    rosterView(rows, { ...options, group: "missing" }).counts.all,
    0,
  );
});
