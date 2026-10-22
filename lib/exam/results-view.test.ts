import test from "node:test";
import assert from "node:assert/strict";
import type { TeacherExamRow } from "./types";
import { groupExamResults } from "./results-view";
const row = (
  studentId: string,
  name: string,
  groupId: string,
  className: string,
): TeacherExamRow => ({
  studentId,
  name,
  groupId,
  className,
  status: "not-started",
  generation: 0,
  previousAttempts: 0,
  startedAt: null,
  submittedAt: null,
  departures: 0,
  quizPoints: null,
  codePoints: null,
  total: null,
});
test("exam results stay grouped by class identity and support class/name/ID filtering", () => {
  const students = [
    row("19S02", "Б.Од", "classB", "8Б"),
    row("19S01", "Г.Болд", "classA", "8А"),
    row("19S03", "О.Саруул", "classA", "8А"),
  ];
  const all = groupExamResults(students, "all", "");
  assert.deepEqual(
    all.map((g) => g.name),
    ["8А", "8Б"],
  );
  assert.equal(all[0].students.length, 2);
  assert.deepEqual(
    groupExamResults(students, "classA", "").flatMap((g) =>
      g.students.map((s) => s.studentId),
    ),
    ["19S01", "19S03"],
  );
  assert.deepEqual(
    groupExamResults(students, "all", "19s02").map((g) => g.id),
    ["classB"],
  );
  assert.deepEqual(
    groupExamResults(students, "classA", "саруул")[0].students.map(
      (s) => s.studentId,
    ),
    ["19S03"],
  );
  assert.deepEqual(groupExamResults(students, "classB", "саруул"), []);
});
