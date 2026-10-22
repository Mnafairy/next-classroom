import test from "node:test";
import assert from "node:assert/strict";
import { parseLmsImport } from "./lms-import";
import { schoolFixture } from "./test-fixtures";

test("LMS import retains only needed fields, deduplicates shared students/classes, preserves ID strings", () => {
  const plan = parseLmsImport(schoolFixture());
  assert.equal(plan.teachers.length, 3);
  assert.equal(plan.groups.length, 2);
  assert.equal(plan.students.length, 2);
  assert.equal(plan.students[0].id, "001");
  assert.deepEqual(plan.students[0].teacherIds, ["alpha", "beta"]);
  assert.deepEqual(plan.groups[0].teacherIds, ["alpha", "beta"]);
  assert.ok(!JSON.stringify(plan).includes("excluded-"));
  assert.ok(!("password" in plan.teachers[0]));
});
test("import rejects duplicate student codes, class conflicts and unexpected teachers before writes", () => {
  const bad = schoolFixture();
  bad.teachers[2].grades[0].classes[0].courses[0].students = [
    {
      id: "different",
      studentCode: "001",
      displayName: "Other",
      classId: "c2",
    },
  ];
  assert.throws(() => parseLmsImport(bad));
  const extra = schoolFixture();
  extra.teachers.pop();
  assert.throws(() => parseLmsImport(extra));
  const email = schoolFixture();
  email.teachers[0].email = "outside@example.com";
  assert.throws(() => parseLmsImport(email));
});
test("Grade 9 rosters retain the student's class and assigned teacher", () => {
  const fixture = schoolFixture();
  const grade = fixture.teachers[2].grades[0];
  grade.grade = 9;
  grade.classes[0].grade = 9;
  grade.classes[0].name = "9А";
  const plan = parseLmsImport(fixture);
  const group = plan.groups.find((g) => g.grade === 9);
  assert.equal(group?.name, "9А");
  assert.deepEqual(group?.teacherIds, ["gamma"]);
  assert.deepEqual(
    plan.students.find((s) => s.classSourceId === group?.sourceId)?.teacherIds,
    ["gamma"],
  );
});
