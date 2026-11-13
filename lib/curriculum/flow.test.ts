import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { curriculumFlow, lessonFlowMode } from "./flow";

test("JavaScript animation output matches real execution, including empty loops and condition boundaries", () => {
  for (const mode of ["if", "for", "while"] as const) {
    for (const value of mode === "if" ? [0, 19, 20, 21, 100] : [0, 1, 3, 6]) {
      const flow = curriculumFlow(mode, value, "javascript");
      const output: string[] = [];
      runInNewContext(
        flow.code.join("\n"),
        { console: { log: (v: unknown) => output.push(String(v)) } },
        { timeout: 1000 },
      );
      assert.deepEqual(flow.frames.at(-1)?.output, output);
      for (const frame of flow.frames) {
        assert(frame.line >= 0 && frame.line <= flow.code.length);
        assert(flow.nodes.some((node) => node.id === frame.node));
        assert(
          !frame.edge || flow.edges.some((edge) => edge.id === frame.edge),
        );
      }
      if (mode !== "if") {
        assert.equal(
          flow.frames.filter((frame) => frame.node === "body").length,
          value,
        );
        assert.equal(
          flow.frames.filter((frame) => frame.node === "condition").length,
          value + 1,
        );
      }
    }
  }
});
test("curriculum attaches demonstrations to conditions and loops only", () => {
  assert.equal(lessonFlowMode("for-loops"), "for");
  assert.equal(lessonFlowMode("while-loops"), "while");
  assert.equal(lessonFlowMode("conditions"), "if");
  assert.equal(lessonFlowMode("responsive-grid"), null);
});
