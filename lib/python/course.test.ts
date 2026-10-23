import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { exercises, modules } from "./course";
import { questions } from "./questions";
import {
  emptyProgress,
  normalizeStudent,
  restoreProgress,
  storageKey,
  validStudent,
} from "./storage";

const harness = readFileSync(
  new URL("../../public/python/harness.py", import.meta.url),
  "utf8",
);
function python(requests: object[]) {
  const source = `${harness}\nimport sys\nrequests = json.load(sys.stdin)\nprint(json.dumps([run_request(request) for request in requests], ensure_ascii=False))`;
  const result = spawnSync("python3", ["-c", source], {
    input: JSON.stringify(requests),
    encoding: "utf8",
    timeout: 15000,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as {
    output: string;
    error?: string;
    checks: { label: string; passed: boolean }[];
  }[];
}

test("the course has 28 unique exercises across seven modules and a quiz per module", () => {
  assert.equal(exercises.length, 28);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 28);
  assert.equal(questions.length, 21);
  for (const [index] of modules.entries()) {
    assert(exercises.some((exercise) => exercise.module === index));
    assert.equal(
      questions.filter((question) => question.module === index).length,
      3,
    );
  }
  for (const exercise of exercises) {
    assert(exercise.tests.length > 0);
    assert(exercise.requirements.length > 0);
    assert(exercise.hints.length > 0);
  }
});

test("every Python solution passes all structure and behavior checks", () => {
  const results = python(
    exercises.map((exercise) => ({
      mode: "check",
      code: exercise.solution,
      tests: exercise.tests,
      requirements: exercise.requirements,
    })),
  );
  results.forEach((result, index) => {
    assert(!result.error, `${exercises[index].id}: ${result.error}`);
    assert(result.checks.length > 0);
    assert.deepEqual(
      result.checks.filter((check) => !check.passed),
      [],
      exercises[index].id,
    );
  });
});

test("every sample runs with its supplied input and produces the stated output", () => {
  const results = python(
    exercises.map((exercise) => ({
      code: exercise.solution,
      inputs: exercise.inputs ?? [],
    })),
  );
  results.forEach((result, index) => {
    assert(!result.error, `${exercises[index].id}: ${result.error}`);
    assert.equal(result.output, exercises[index].expected, exercises[index].id);
  });
});

test("hard-coded output and a wrong boundary cannot pass the battery exercise", () => {
  const exercise = exercises.find((exercise) => exercise.id === "battery")!;
  const results = python([
    {
      mode: "check",
      code: 'battery = 15\n# if\nprint("Батерейгаа цэнэглээрэй.")',
      tests: exercise.tests,
      requirements: exercise.requirements,
    },
    {
      mode: "check",
      code: exercise.solution.replace("<= 20", "< 20"),
      tests: exercise.tests,
      requirements: exercise.requirements,
    },
  ]);
  assert(
    results[0].checks.some(
      (check) => !check.passed && check.label.includes("if"),
    ),
  );
  assert(
    results[0].checks.some(
      (check) => !check.passed && check.label.includes("21"),
    ),
  );
  assert(
    results[1].checks.some(
      (check) => !check.passed && check.label.includes("20"),
    ),
  );
});

test("requirement detection uses syntax and ignores comments and strings", () => {
  const [result] = python([
    {
      mode: "check",
      code: '# for input()\nprint("while break continue")',
      requirements: [
        { kind: "node", name: "For", label: "for" },
        { kind: "call", name: "input", label: "input" },
      ],
    },
  ]);
  assert(result.checks.every((check) => !check.passed));
});

test("input errors, syntax errors and output limits return useful feedback", () => {
  const results = python([
    { code: "a = int(input())\nb = int(input())", inputs: ["2"] },
    { code: "if True\n    print(1)" },
    { code: 'for i in range(100000):\n    print("hello")' },
    { code: 'print(int("hello"))' },
  ]);
  assert(results[0].error?.includes("Оролт хүрэлцэхгүй"));
  assert(results[1].error?.includes("мөр 1"));
  assert(results[2].error?.includes("хэт урт"));
  assert(results[3].error?.includes("ValueError"));
});

test("each testcase starts with a fresh namespace and only the initial test value changes", () => {
  const [result] = python([
    {
      mode: "check",
      code: "nas = 15\nnas = nas + 1\nprint(nas)",
      tests: [
        { label: "1", variables: { nas: 20 }, expected: "21" },
        { label: "2", variables: { nas: 8 }, expected: "9" },
      ],
    },
  ]);
  assert(result.checks.every((check) => check.passed));
});

test("progress restore tolerates corrupt storage and filters unknown or solution-assisted completions", () => {
  assert.deepEqual(restoreProgress("invalid"), emptyProgress());
  assert.deepEqual(restoreProgress('{"version":99}'), emptyProgress());
  const restored = restoreProgress(
    JSON.stringify({
      version: 1,
      active: "unknown",
      completed: ["battery", "battery", "unknown", "hello"],
      drafts: {
        hello: { code: "print(1)", solutionViewed: true },
        battery: { code: "# draft", inputs: "20" },
        unknown: { code: "x" },
      },
      quizAttempts: {
        all: { answers: { "input-type": 1, bad: 99 }, submitted: false },
      },
    }),
  );
  assert.equal(restored.active, "hello");
  assert.deepEqual(restored.completed, ["battery"]);
  assert.equal(restored.drafts.battery.code, "# draft");
  assert.equal(restored.drafts.unknown, undefined);
  assert.deepEqual(restored.quizAttempts.all.answers, { "input-type": 1 });
});

test("student IDs normalize consistently and are kept in separate storage keys", () => {
  assert.equal(normalizeStudent(" 10a-01 "), "10A-01");
  assert(validStudent("10А-01"));
  assert(validStudent("САРУУЛ"));
  assert(validStudent(normalizeStudent("orgilsaikhan.ch")));
  assert(validStudent("A".repeat(40)));
  assert(!validStudent("A".repeat(41)));
  assert(!validStudent("a"));
  assert(!validStudent("has space"));
  assert.notEqual(storageKey("10A-01"), storageKey("10A-02"));
});

test("Python ID entry rejects values the shared server cannot accept", () => {
  for (const id of ["--", "_A", "-01"]) assert.equal(validStudent(id), false);
});
