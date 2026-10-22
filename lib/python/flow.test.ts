import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { makeFlow, type FlowMode } from "./flow";

test("for and while animations perform N bodies and N + 1 condition checks", () => {
  for (const mode of ["for", "while"] as const) {
    for (const n of [1, 3, 5, 6]) {
      const lesson = makeFlow(mode, n);
      assert.equal(
        lesson.frames.filter((frame) => frame.node === "body").length,
        n,
      );
      assert.equal(
        lesson.frames.filter((frame) => frame.node === "condition").length,
        n + 1,
      );
      assert.equal(
        lesson.frames.filter((frame) => frame.node === "increment").length,
        mode === "while" ? n : 0,
      );
      assert.equal(
        lesson.frames.at(-1)?.variable,
        String(mode === "while" ? n + 1 : n),
      );
      assert.deepEqual(lesson.frames.at(-1)?.output, [
        ...Array.from({ length: n }, (_, i) => String(i + 1)),
        "Дууслаа",
      ]);
    }
  }
});

test("if animation follows exactly one branch and includes equality at 20", () => {
  for (const battery of [0, 15, 20, 21, 100]) {
    const lesson = makeFlow("if", battery);
    const yes = lesson.frames.some((frame) => frame.node === "yes");
    const no = lesson.frames.some((frame) => frame.node === "no");
    assert.equal(yes, battery <= 20);
    assert.equal(no, battery > 20);
    assert(lesson.frames.some((frame) => frame.node === "after"));
    assert.equal(
      lesson.frames.find((frame) => frame.node === "condition")?.condition,
      battery <= 20,
    );
    assert.equal(
      lesson.frames.find((frame) => frame.node === (yes ? "yes" : "no"))?.line,
      yes ? 3 : 5,
    );
  }
});

test("every highlighted node, path and line exists and each animation matches real Python output", () => {
  for (const [mode, values] of [
    ["if", [15, 20, 21, 80]],
    ["for", [1, 3, 6]],
    ["while", [1, 3, 6]],
  ] as [FlowMode, number[]][]) {
    for (const value of values) {
      const lesson = makeFlow(mode, value);
      for (const frame of lesson.frames) {
        assert(lesson.nodes.some((node) => node.id === frame.node));
        assert(
          !frame.edge || lesson.edges.some((edge) => edge.id === frame.edge),
        );
        assert(frame.line >= 0 && frame.line <= lesson.code.length);
      }
      const actual = spawnSync("python3", ["-c", lesson.code.join("\n")], {
        encoding: "utf8",
      });
      assert.equal(actual.status, 0, actual.stderr);
      assert.equal(
        lesson.frames.at(-1)?.output.join("\n"),
        actual.stdout.trim(),
      );
    }
  }
});
