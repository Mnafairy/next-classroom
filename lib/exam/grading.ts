import ts from "typescript";
import { examExercises, examQuestions } from "./content";
import { runExamCode, type Inputs } from "./interpreter";
import type { ExamAnswers } from "./protocol";

export const answerKey = [
  2, 1, 3, 2, 0, 1, 3, 1, 2, 0, 3, 1, 2, 0, 2, 3, 1, 2, 3, 1,
];
type Case = { inputs: Inputs; output: string };
export const codeCases: Record<string, Case[]> = {
  c01: [
    [8, 5],
    [3, 11],
    [1, 1],
    [12, 4],
    [6, 6],
  ].map(([width, height]) => ({
    inputs: { width, height },
    output: String(2 * (width + height)),
  })),
  c02: [
    [24, 9, 7],
    [0, 5, 3],
    [8, 0, 8],
    [3, 4, 0],
    [15, 12, 14],
  ].map(([stock, added, sent]) => ({
    inputs: { stock, added, sent },
    output: String(stock + added - sent),
  })),
  c03: [143, 0, 59, 60, 121, 3600].map((seconds) => ({
    inputs: { seconds },
    output: String(seconds % 60),
  })),
  c04: [5, 0, 4, 6, 12].map((lateMinutes) => ({
    inputs: { lateMinutes },
    output: lateMinutes <= 5 ? "Амжсан" : "Хоцорсон",
  })),
  c05: [
    [false, true],
    [false, false],
    [true, false],
    [true, true],
  ].map(([owner, invited]) => ({
    inputs: { owner, invited },
    output: owner || invited ? "Нээнэ" : "Хаалттай",
  })),
  c06: [9, 0, 4, 5, 10, 18].map((items) => ({
    inputs: { items },
    output: items < 5 ? "Жижиг" : items < 10 ? "Дунд" : "Том",
  })),
};
function structure(code: string, id: string) {
  const file = ts.createSourceFile(
    "exam.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  let hasRemainder = false,
    hasIf = false,
    hasOr = false,
    assignsStock = false;
  const visit = (node: ts.Node) => {
    if (ts.isIfStatement(node)) hasIf = true;
    if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind === ts.SyntaxKind.PercentToken)
        hasRemainder = true;
      if (node.operatorToken.kind === ts.SyntaxKind.BarBarToken) hasOr = true;
      if (
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(node.left) &&
        node.left.text === "stock"
      )
        assignsStock = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return (
    (id !== "c02" || assignsStock) &&
    (id !== "c03" || hasRemainder) &&
    (!["c04", "c05", "c06"].includes(id) || hasIf) &&
    (id !== "c05" || hasOr)
  );
}
export function gradeExam(answers: ExamAnswers) {
  const questions = examQuestions.map((q, index) => ({
    id: q.id,
    correct: answers.choices[q.id] === answerKey[index],
    points: answers.choices[q.id] === answerKey[index] ? 2 : 0,
  }));
  const exercises = examExercises.map((e) => {
    const code = answers.code[e.id] || "";
    let passed = 0;
    try {
      if (structure(code, e.id))
        for (const c of codeCases[e.id]) {
          const out = runExamCode(code, c.inputs);
          if (out.length === 1 && out[0].trim() === c.output) passed++;
        }
    } catch {
      /* Invalid code earns only the cases already passed. */
    }
    return {
      id: e.id,
      passed,
      total: codeCases[e.id].length,
      points: Math.round((10 * passed) / codeCases[e.id].length),
    };
  });
  return {
    questions,
    exercises,
    quizPoints: questions.reduce((s, q) => s + q.points, 0),
    codePoints: exercises.reduce((s, e) => s + e.points, 0),
    total:
      questions.reduce((s, q) => s + q.points, 0) +
      exercises.reduce((s, e) => s + e.points, 0),
  };
}
