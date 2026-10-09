import ts from "typescript";
import path from "node:path";
import { BUTTON, CARD, PAGE } from "./lessons";
import type { CheckResult, Exercise, Files } from "./types";

export function validateSources(
  exercise: Exercise,
  files: Files,
): CheckResult[] {
  const base = path.join(process.cwd(), ".lesson-virtual");
  const virtual = new Map(
    Object.entries(files).map(([file, code]) => [base + file, code]),
  );
  const restrictions: string[] = [];
  for (const [file, code] of virtual) {
    if (/@ts-(ignore|nocheck|expect-error)\b/.test(code))
      restrictions.push("Keep code checking enabled for this exercise.");
    const source = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TSX,
    );
    if (
      source.referencedFiles.length ||
      source.typeReferenceDirectives.length ||
      source.libReferenceDirectives.length
    )
      restrictions.push("Use only the supplied files for this lab.");
    const visit = (node: ts.Node) => {
      const importPath =
        ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : undefined;
      if (
        importPath !== undefined &&
        importPath !== "react" &&
        !Object.keys(exercise.starter).some(
          (supplied) =>
            base + supplied ===
            path.resolve(path.dirname(file), importPath + ".tsx"),
        )
      )
        restrictions.push(
          "This lab uses only the supplied component files and React imports.",
        );
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      )
        restrictions.push("Use the static imports shown in this lesson.");
      if (
        ts.isImportTypeNode(node) ||
        (ts.isExportDeclaration(node) && node.moduleSpecifier)
      )
        restrictions.push(
          "Use the direct imports and exports shown in this lesson.",
        );
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  if (restrictions.length)
    return [
      {
        label: "Check JavaScript and JSX",
        passed: false,
        detail: [...new Set(restrictions)].join("\n"),
      },
    ];
  const options: ts.CompilerOptions = {
    strict: true,
    noImplicitAny: exercise.module < 3,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: ["react", "react-dom"],
    lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
  };
  const host = ts.createCompilerHost(options);
  const originalSource = host.getSourceFile.bind(host);
  const originalFile = host.fileExists.bind(host);
  const originalDirectory = host.directoryExists?.bind(host);
  host.fileExists = (file) => virtual.has(file) || originalFile(file);
  host.directoryExists = (dir) =>
    dir.startsWith(base) || !!originalDirectory?.(dir);
  host.getSourceFile = (file, language, onError, shouldCreate) =>
    virtual.has(file)
      ? ts.createSourceFile(
          file,
          virtual.get(file)!,
          language,
          true,
          ts.ScriptKind.TSX,
        )
      : originalSource(file, language, onError, shouldCreate);
  const program = ts.createProgram([...virtual.keys()], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) => !diagnostic.file || virtual.has(diagnostic.file.fileName),
    );
  const messages = diagnostics.slice(0, 4).map((diagnostic) => {
    const location =
      diagnostic.file && diagnostic.start !== undefined
        ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        : undefined;
    return `${diagnostic.file ? path.basename(diagnostic.file.fileName) : "TypeScript"}${location ? `:${location.line + 1}` : ""}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`;
  });
  const checks: CheckResult[] = [
    {
      label: "Check JavaScript and JSX",
      passed: diagnostics.length === 0 && restrictions.length === 0,
      detail: [...restrictions, ...messages].join("\n"),
    },
  ];
  const button = program.getSourceFile(base + BUTTON);
  const card = program.getSourceFile(base + CARD);
  const page = program.getSourceFile(base + PAGE);
  const checker = program.getTypeChecker();
  const buttonSymbol = button && checker.getSymbolAtLocation(button);
  const defaultExport =
    buttonSymbol &&
    checker
      .getExportsOfModule(buttonSymbol)
      .find((symbol) => symbol.name === "default");
  checks.push({
    label: "Default-export a Button component",
    passed: !!defaultExport,
  });
  const imports =
    (card ?? page)?.statements.filter(ts.isImportDeclaration) ?? [];
  const buttonImport = imports.find(
    (node) =>
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text ===
        (card ? "./Button" : "./components/Button") &&
      !!node.importClause?.name,
  );
  const localName = buttonImport?.importClause?.name?.text;
  let renderCount = 0;
  let hasInlineStyle = false;
  const walk = (node: ts.Node) => {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText() === localName
    )
      renderCount++;
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText() === "style" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    )
      hasInlineStyle = true;
    ts.forEachChild(node, walk);
  };
  if (card) walk(card);
  else if (page) walk(page);
  if (button) walk(button);
  checks.push({
    label: card
      ? "Import and render Button inside Card.tsx"
      : "Import and render the component in page.tsx",
    passed: !!buttonImport && renderCount > 0,
  });
  if (card) {
    const cardSymbol = checker.getSymbolAtLocation(card);
    checks.push({
      label: "Default-export a Card component",
      passed:
        !!cardSymbol &&
        checker
          .getExportsOfModule(cardSymbol)
          .some((symbol) => symbol.name === "default"),
    });
    const cardImport = page?.statements
      .filter(ts.isImportDeclaration)
      .find(
        (node) =>
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === "./components/Card" &&
          !!node.importClause?.name,
      );
    const cardName = cardImport?.importClause?.name?.text;
    let rendersCard = false;
    const visitCard = (node: ts.Node) => {
      if (
        (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
        node.tagName.getText() === cardName
      )
        rendersCard = true;
      ts.forEachChild(node, visitCard);
    };
    if (page) visitCard(page);
    checks.push({
      label: "Import and render Card in page.tsx",
      passed: !!cardImport && rendersCard,
    });
  }
  if (exercise.styled)
    checks.push({
      label: "Style the button with a JSX style object",
      passed: hasInlineStyle,
    });
  if (exercise.clientFile) {
    const source = program.getSourceFile(base + exercise.clientFile);
    const first = source?.statements[0];
    checks.push({
      label: `Start ${path.basename(exercise.clientFile)} with "use client"`,
      passed:
        !!first &&
        ts.isExpressionStatement(first) &&
        ts.isStringLiteral(first.expression) &&
        first.expression.text === "use client",
      detail:
        "Put the directive before imports so the interactive component works in Next.js.",
    });
  }
  if (exercise.stateFile) {
    const source = program.getSourceFile(base + exercise.stateFile);
    const stateImport = source?.statements
      .filter(ts.isImportDeclaration)
      .find(
        (node) =>
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === "react" &&
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings) &&
          node.importClause.namedBindings.elements.some(
            (element) =>
              (element.propertyName ?? element.name).text === "useState",
          ),
      );
    const bindings = stateImport?.importClause?.namedBindings;
    const stateName =
      bindings && ts.isNamedImports(bindings)
        ? bindings.elements.find(
            (element) =>
              (element.propertyName ?? element.name).text === "useState",
          )?.name.text
        : undefined;
    let callsState = false;
    const walkState = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === stateName
      )
        callsState = true;
      ts.forEachChild(node, walkState);
    };
    if (source) walkState(source);
    checks.push({
      label: "Import and use React's useState",
      passed: !!stateImport && callsState,
    });
  }
  return checks;
}
