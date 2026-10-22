import ts from "typescript";

type Value = string | number | boolean;
export type Inputs = Record<string, Value>;

// Interpret only the taught expression/if subset. Student code is never eval'd.
export function runExamCode(code: string, inputs: Inputs = {}) {
  if (code.length > 12000) throw new Error("Код 12,000 тэмдэгтээс хэтэрсэн.");
  const file = ts.createSourceFile(
    "exam.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  if (
    "parseDiagnostics" in file &&
    Array.isArray(file.parseDiagnostics) &&
    file.parseDiagnostics.length
  )
    throw new Error("Кодын хаалт, хашилт болон бичлэгээ шалгаарай.");
  const values = new Map<string, Value>();
  const replaced = new Set<string>();
  const output: string[] = [];
  let steps = 0;
  function step(depth: number) {
    if (++steps > 2000 || depth > 60)
      throw new Error("Код хэт урт эсвэл хэт олон давхар нөхцөлтэй байна.");
  }
  function number(value: Value) {
    if (typeof value !== "number")
      throw new Error("Энэ үйлдэлд тоо ашиглаарай.");
    return value;
  }
  function expression(node: ts.Expression, depth = 0): Value {
    step(depth);
    if (ts.isParenthesizedExpression(node))
      return expression(node.expression, depth + 1);
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text.length > 4000) throw new Error("Текст хэт урт байна.");
      return node.text;
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isIdentifier(node)) {
      const value = values.get(node.text);
      if (value === undefined)
        throw new Error(`${node.text} хувьсагч зарлагдаагүй байна.`);
      return value;
    }
    if (ts.isPrefixUnaryExpression(node)) {
      const value = expression(node.operand, depth + 1);
      if (node.operator === ts.SyntaxKind.MinusToken) return -number(value);
      if (node.operator === ts.SyntaxKind.PlusToken) return number(value);
      if (node.operator === ts.SyntaxKind.ExclamationToken) return !value;
    }
    if (ts.isBinaryExpression(node)) {
      const kind = node.operatorToken.kind;
      if (kind === ts.SyntaxKind.EqualsToken) {
        if (!ts.isIdentifier(node.left) || !values.has(node.left.text))
          throw new Error("Зарласан хувьсагчид утга оноогоорой.");
        const value = expression(node.right, depth + 1);
        values.set(node.left.text, value);
        return value;
      }
      const left = expression(node.left, depth + 1);
      if (kind === ts.SyntaxKind.AmpersandAmpersandToken)
        return left && expression(node.right, depth + 1);
      if (kind === ts.SyntaxKind.BarBarToken)
        return left || expression(node.right, depth + 1);
      const right = expression(node.right, depth + 1);
      switch (kind) {
        case ts.SyntaxKind.PlusToken:
          if (typeof left === "string" || typeof right === "string") {
            if (String(left).length + String(right).length > 4000)
              throw new Error("Текст хэт урт байна.");
            return String(left) + String(right);
          }
          return number(left) + number(right);
        case ts.SyntaxKind.MinusToken:
          return number(left) - number(right);
        case ts.SyntaxKind.AsteriskToken:
          return number(left) * number(right);
        case ts.SyntaxKind.SlashToken:
          return number(left) / number(right);
        case ts.SyntaxKind.PercentToken:
          return number(left) % number(right);
        case ts.SyntaxKind.GreaterThanToken:
          return number(left) > number(right);
        case ts.SyntaxKind.GreaterThanEqualsToken:
          return number(left) >= number(right);
        case ts.SyntaxKind.LessThanToken:
          return number(left) < number(right);
        case ts.SyntaxKind.LessThanEqualsToken:
          return number(left) <= number(right);
        // Match JavaScript's taught equality semantics without executing JS.
        case ts.SyntaxKind.EqualsEqualsToken:
          return left == right;
        case ts.SyntaxKind.ExclamationEqualsToken:
          return left != right;
        case ts.SyntaxKind.EqualsEqualsEqualsToken:
          return left === right;
        case ts.SyntaxKind.ExclamationEqualsEqualsToken:
          return left !== right;
      }
    }
    throw new Error(
      "Энэ шалгалтад let, =, арифметик, if / else, &&, ||, console.log ашиглаарай.",
    );
  }
  function statement(node: ts.Statement, depth = 0) {
    step(depth);
    if (ts.isBlock(node)) {
      node.statements.forEach((child) => statement(child, depth + 1));
      return;
    }
    if (ts.isEmptyStatement(node)) return;
    if (ts.isVariableStatement(node)) {
      if (!(node.declarationList.flags & ts.NodeFlags.Let))
        throw new Error("Хувьсагчийг let ашиглан зарлаарай.");
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer)
          throw new Error("let нэр = утга; хэлбэрээр бичээрэй.");
        const name = declaration.name.text;
        if (values.has(name))
          throw new Error(`${name} хувьсагч давхар зарлагдсан.`);
        const value = expression(declaration.initializer, depth + 1);
        if (depth === 0 && Object.hasOwn(inputs, name)) {
          values.set(name, inputs[name]);
          replaced.add(name);
        } else values.set(name, value);
      }
      return;
    }
    if (ts.isIfStatement(node)) {
      if (expression(node.expression, depth + 1))
        statement(node.thenStatement, depth + 1);
      else if (node.elseStatement) statement(node.elseStatement, depth + 1);
      return;
    }
    if (ts.isExpressionStatement(node)) {
      const e = node.expression;
      if (
        ts.isCallExpression(e) &&
        ts.isPropertyAccessExpression(e.expression) &&
        ts.isIdentifier(e.expression.expression) &&
        e.expression.expression.text === "console" &&
        e.expression.name.text === "log" &&
        !values.has("console")
      ) {
        if (
          !e.arguments.length ||
          e.arguments.length > 10 ||
          output.length >= 20
        )
          throw new Error("Хэвлэх мөрийн хязгаарыг хэтрүүлсэн.");
        const line = e.arguments
          .map((arg) => String(expression(arg, depth + 1)))
          .join(" ");
        if (
          line.length > 4000 ||
          output.reduce((size, item) => size + item.length, 0) + line.length >
            20000
        )
          throw new Error("Гаралт хэт урт байна.");
        output.push(line);
      } else expression(e, depth + 1);
      return;
    }
    throw new Error(
      "Давталт, функц, import болон вебийн үйлдэл энэ шалгалтад ашиглахгүй.",
    );
  }
  file.statements.forEach((node) => statement(node));
  for (const name of Object.keys(inputs))
    if (!replaced.has(name))
      throw new Error(`Эхний ${name} хувьсагчийг хадгалаарай.`);
  return output;
}
