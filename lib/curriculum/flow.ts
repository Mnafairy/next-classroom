import { makeFlow, type FlowMode, type FlowLesson } from "../python/flow";

export function curriculumFlow(
  mode: FlowMode,
  value: number,
  language: "python" | "javascript",
): FlowLesson {
  const flow = makeFlow(
    language === "javascript" && mode === "for" ? "while" : mode,
    value,
  );
  if (language === "python") return flow;
  const convert = (text: string) =>
    text
      .replaceAll("print(", "console.log(")
      .replaceAll("True", "true")
      .replaceAll("False", "false");
  const code =
    mode === "if"
      ? [
          `let battery = ${value};`,
          "if (battery <= 20) {",
          '  console.log("Цэнэглээрэй");',
          "} else {",
          '  console.log("Хангалттай");',
          "}",
          'console.log("Шалгаж дууслаа");',
        ]
      : mode === "for"
        ? [
            `let n = ${value};`,
            "for (let i = 1; i <= n; i++) {",
            "  console.log(i);",
            "}",
            'console.log("Дууслаа");',
          ]
        : [
            `let n = ${value};`,
            "let i = 1;",
            "while (i <= n) {",
            "  console.log(i);",
            "  i += 1;",
            "}",
            'console.log("Дууслаа");',
          ];
  return {
    ...flow,
    title: mode === "for" ? "for — тоолууртай давталт" : flow.title,
    code,
    nodes: flow.nodes.map((node) => ({
      ...node,
      label: node.label.map(convert),
    })),
    edges: flow.edges.map((edge) => ({
      ...edge,
      label: edge.label ? convert(edge.label) : undefined,
    })),
    frames: flow.frames.map((frame) => ({
      ...frame,
      line:
        mode === "for"
          ? ([0, 1, 2, 2, 3, 2, 5][frame.line] ?? 0)
          : frame.line === 6
            ? 7
            : frame.line,
      variable:
        mode === "for" && ["after", "end"].includes(frame.node)
          ? "—"
          : frame.variable,
      message:
        mode === "for" && frame.node === "end"
          ? `Давталт ${value} удаа ажиллалаа. let i нь зөвхөн for дотор ашиглагдана.`
          : convert(frame.message),
    })),
  };
}

export function lessonFlowMode(id: string): FlowMode | null {
  if (
    [
      "conditions",
      "elif",
      "ticket-logic",
      "conditional-game",
      "form-validation",
      "rule-system",
      "validate-data",
    ].includes(id)
  )
    return "if";
  if (["while-loops", "guess-with-count"].includes(id)) return "while";
  if (
    [
      "for-loops",
      "nested-for",
      "compare-loops",
      "loop-statistics",
      "search-break-continue",
    ].includes(id)
  )
    return "for";
  return null;
}
