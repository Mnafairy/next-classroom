import test from "node:test";
import assert from "node:assert/strict";
import { EXAM_MINUTES, examQuestions, examExercises } from "./content";
import { answerKey, gradeExam } from "./grading";
import { hasCodeAnswer, parseAnswers } from "./protocol";
import { runExamCode } from "./interpreter";
import {
  questions as oldQuestions,
  exercises as oldExercises,
} from "../../apps/kodlab/src/content.js";

const solutions = {
  c01: "let width=8;let height=5;console.log(2*(width+height));",
  c02: "let stock=24;let added=9;let sent=7;stock=stock+added-sent;console.log(stock);",
  c03: "let seconds=143;console.log(seconds%60);",
  c04: 'let lateMinutes=5;if(lateMinutes<=5){console.log("Амжсан");}else{console.log("Хоцорсон");}',
  c05: 'let owner=false;let invited=true;if(owner==true||invited==true){console.log("Нээнэ");}else{console.log("Хаалттай");}',
  c06: 'let items=9;if(items<5){console.log("Жижиг");}else if(items<10){console.log("Дунд");}else{console.log("Том");}',
};
test("exam has exactly 20 fresh questions and six fresh tasks for 35 minutes", () => {
  assert.equal(EXAM_MINUTES, 35);
  assert.equal(examQuestions.length, 20);
  assert.equal(examExercises.length, 6);
  assert.equal(new Set(examQuestions.map((q) => q.id)).size, 20);
  for (const q of examQuestions) {
    assert.equal(q.options.length, 4);
    assert.ok(
      !oldQuestions.some(
        (old) => old.prompt === q.prompt || (old.code && old.code === q.code),
      ),
    );
  }
  for (const e of examExercises)
    assert.ok(
      !oldExercises.some(
        (old) => old.title === e.title || old.starter === e.starter,
      ),
    );
  assert.ok(
    !JSON.stringify({ examQuestions, examExercises }).includes('"answer":'),
  );
});
test("server grades variable inputs and boundary cases, with a total of 100", () => {
  const answers = {
    choices: Object.fromEntries(
      examQuestions.map((q, i) => [q.id, answerKey[i]]),
    ),
    code: solutions,
  };
  const result = gradeExam(answers);
  assert.equal(result.total, 100);
  assert.equal(result.quizPoints, 40);
  assert.equal(result.codePoints, 60);
  assert.ok(result.exercises.every((e) => e.passed === e.total));
  assert.equal(gradeExam({ choices: {}, code: {} }).total, 0);
  const fixed = gradeExam({
    choices: {},
    code: { c01: "let width=8;let height=5;console.log(26);" },
  });
  assert.ok(fixed.codePoints < 10);
  assert.equal(
    gradeExam({
      choices: {},
      code: {
        c02: "let stock=24;let added=9;let sent=7;console.log(stock+added-sent);",
      },
    }).codePoints,
    0,
  );
});
test("code interpreter supports the taught subset without running arbitrary JavaScript", () => {
  assert.deepEqual(
    runExamCode('let x=2; x=x+3; if(x>=5 && x<8) console.log("OK",x);'),
    ["OK 5"],
  );
  for (const code of [
    "process.exit()",
    'fetch("https://example.com")',
    'console.log.constructor("return process")()',
    "while(true) {}",
    "let x = ; console.log(1);",
    "let x=1;console.log(x.constructor);",
    'import fs from "node:fs";',
    'let x=1; eval("1");',
  ])
    assert.throws(() => runExamCode(code));
  assert.throws(() => runExamCode("console.log(3);", { width: 3 }));
  assert.throws(() => runExamCode("a".repeat(12001)));
  assert.throws(() =>
    runExamCode(
      'let text="ab";' + "text=text+text;".repeat(20) + "console.log(text);",
    ),
  );
});
test("answer input rejects forged IDs, huge code and invalid choices", () => {
  assert.equal(hasCodeAnswer("let x=1;", undefined), false);
  assert.equal(hasCodeAnswer("let x=1;", "  "), false);
  assert.equal(hasCodeAnswer("let x=1;", "let x=1;\n"), false);
  assert.equal(hasCodeAnswer("let x=1;", "let x=1;console.log(x);"), true);
  assert.deepEqual(
    parseAnswers({ choices: { q01: 0 }, code: { c01: "let width=1;" } }),
    { choices: { q01: 0 }, code: { c01: "let width=1;" } },
  );
  for (const body of [
    { choices: { q99: 1 }, code: {} },
    { choices: { q01: 4 }, code: {} },
    { choices: { q01: "2" }, code: {} },
    { choices: {}, code: { c01: "a".repeat(12001) } },
    { choices: [], code: {} },
    { choices: {}, code: { constructor: "bad" } },
  ])
    assert.throws(() => parseAnswers(body));
});
