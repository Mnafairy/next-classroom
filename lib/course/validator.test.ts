import test from "node:test";
import assert from "node:assert/strict";
import { BUTTON, CARD, PAGE, exercises, findExercise } from "./lessons";
import { cardProbeProps } from "./sandbox";
import { validateSources } from "./validators";
import { validateRuntime, normalizedColor } from "./runtime-checks";
import { sanitizeProgress } from "./progress";
import type { RuntimeReport } from "./types";

for (const exercise of exercises.filter((item) => item.kind === "code")) {
  test(`working solution compiles and meets structural checks: ${exercise.id}`, () => {
    const checks = validateSources(exercise, exercise.solution);
    assert.equal(
      checks.every((check) => check.passed),
      true,
      JSON.stringify(checks),
    );
  });
}
const colorExercise = findExercise("color-props")!;
test("equivalent quote style and props object access are accepted", () => {
  const files = {
    ...colorExercise.solution,
    [BUTTON]:
      "export default function Button(props) { return <button style={{backgroundColor: props.color, color: 'white', padding: '12px 24px'}}>{props.label}</button>; }",
    [PAGE]: colorExercise.solution[PAGE].replaceAll('"', "'"),
  };
  assert.ok(
    validateSources(colorExercise, files).every((check) => check.passed),
  );
});
test("a missing import cannot pass", () => {
  const files = {
    ...colorExercise.solution,
    [PAGE]: "export default function Home() { return <Button />; }",
  };
  assert.ok(
    validateSources(colorExercise, files).some((check) => !check.passed),
  );
});
test("explicit annotations still catch incompatible values", () => {
  const files = {
    ...colorExercise.solution,
    [BUTTON]: colorExercise.solution[BUTTON].replace(
      "{ label, color })",
      "{ label, color }: { label: string; color: string })",
    ),
    [PAGE]: colorExercise.solution[PAGE].replace('color="blue"', "color={123}"),
  };
  const result = validateSources(colorExercise, files)[0];
  assert.equal(result.passed, false);
  assert.match(result.detail!, /number.*string/);
});
test("broken JSX is a compilation failure", () => {
  const files = {
    ...colorExercise.solution,
    [BUTTON]: "export default function Button() { return <button>; }",
  };
  assert.equal(validateSources(colorExercise, files)[0].passed, false);
});
test("type-check bypasses and unrelated imports fail", () => {
  for (const prefix of ["// @ts-nocheck\n", "import fs from 'node:fs';\n"]) {
    assert.equal(
      validateSources(colorExercise, {
        ...colorExercise.solution,
        [BUTTON]: prefix + colorExercise.solution[BUTTON],
      })[0].passed,
      false,
    );
  }
});
const button = (text: string, background: string) => ({
  text,
  background,
  color: "rgb(255, 255, 255)",
  padding: "12px 24px",
});
const report: RuntimeReport = {
  runId: "current",
  buttons: [
    button("Blue button", "rgb(0, 0, 255)"),
    button("Red button", "rgb(255, 0, 0)"),
  ],
  probes: [
    [button("A fresh label", "blue")],
    [button("Another label", "red")],
    [button("A third label", "green")],
  ],
};
test("real output matching the labels, colors, and new props passes", () => {
  assert.ok(
    validateRuntime(colorExercise, report, "current").every(
      (check) => check.passed,
    ),
  );
});
test("hard-coded labels and colors cannot pass even if page output matches", () => {
  const result = validateRuntime(
    colorExercise,
    {
      ...report,
      probes: [
        [button("Blue button", "blue")],
        [button("Blue button", "blue")],
        [button("Blue button", "blue")],
      ],
    },
    "current",
  );
  assert.equal(
    result.find((check) => check.label === "Read each label from props")
      ?.passed,
    false,
  );
  assert.equal(
    result.find(
      (check) =>
        check.label === "Let the color prop control the inline background",
    )?.passed,
    false,
  );
});
test("an old run is rejected", () => {
  assert.equal(
    validateRuntime(colorExercise, report, "newer")[0].passed,
    false,
  );
});
test("runtime errors, wrong button count, and wrong colors fail", () => {
  for (const invalid of [
    { ...report, error: "Component crashed" },
    { ...report, buttons: [] },
    {
      ...report,
      buttons: [button("Blue button", "red"), button("Red button", "red")],
    },
  ])
    assert.ok(
      validateRuntime(colorExercise, invalid, "current").some(
        (check) => !check.passed,
      ),
    );
});
test("hex and named CSS colors compare to computed browser colors", () => {
  assert.equal(normalizedColor("#6D28D9"), "rgb(109,40,217)");
  assert.equal(normalizedColor("rgb(0, 0, 255)"), normalizedColor("blue"));
});
test("invalid or outdated saved progress falls back safely", () => {
  for (const value of [
    null,
    "broken",
    { version: 20 },
    { version: 1, active: "missing", completed: ["fake"], drafts: {} },
  ])
    assert.equal(sanitizeProgress(value).active, "setup");
});
test("progress restores only known exercises and supplied file paths", () => {
  const restored = sanitizeProgress({
    version: 1,
    active: "color-props",
    completed: ["color-props", "color-props", "fake"],
    drafts: {
      "color-props": {
        files: { ...colorExercise.solution, "/extra.tsx": "unexpected" },
        answers: {},
        viewedSolution: false,
      },
    },
  });
  assert.deepEqual(restored.completed, ["color-props"]);
  assert.deepEqual(
    Object.keys(restored.drafts["color-props"].files).sort(),
    [BUTTON, PAGE].sort(),
  );
});

test("saved Module 4 drafts lose lesson types while preserving edits and progress", () => {
  const oldButton =
    "type ButtonProps = {\n  label: string;\n  color: string;\n};\n\n" +
    colorExercise.solution[BUTTON].replace(
      "{ label, color })",
      "{ label, color }: ButtonProps)",
    ).replace('borderRadius: "8px"', 'borderRadius: "12px"');
  const restored = sanitizeProgress({
    version: 1,
    active: "color-props",
    completed: ["read-props"],
    drafts: {
      "color-props": {
        files: { ...colorExercise.solution, [BUTTON]: oldButton },
        answers: {},
        viewedSolution: false,
      },
    },
  });
  assert.doesNotMatch(
    restored.drafts["color-props"].files[BUTTON],
    /ButtonProps|label: string/,
  );
  assert.match(
    restored.drafts["color-props"].files[BUTTON],
    /borderRadius: "12px"/,
  );
  assert.deepEqual(restored.completed, ["read-props"]);
  assert.ok(
    validateSources(colorExercise, restored.drafts["color-props"].files).every(
      (check) => check.passed,
    ),
  );
});

const cardExercise = findExercise("card-lab")!;
const cardReport: RuntimeReport = {
  ...report,
  buttons: cardExercise.expected!.map((item) => button(item.label, item.color)),
  cards: cardExercise.expectedCards!.map((item) => ({
    title: item.title,
    description: item.description,
    buttons: [button(item.buttonLabel, item.color)],
  })),
  cardProbes: cardProbeProps.map((item) => [
    {
      title: item.title,
      description: item.description,
      buttons: [button(item.buttonLabel, item.color)],
    },
  ]),
};
test("cards display their content and forward new props to the nested Button", () => {
  assert.ok(
    validateRuntime(cardExercise, cardReport, "current").every(
      (check) => check.passed,
    ),
  );
});
test("hard-coded Card content or forwarded button props fail", () => {
  for (const cardProbes of [
    cardProbeProps.map(() => [cardReport.cards![0]]),
    cardReport.cardProbes!.map((cards) => [
      { ...cards[0], buttons: [button("Start lesson", "blue")] },
    ]),
  ]) {
    assert.ok(
      validateRuntime(
        cardExercise,
        { ...cardReport, cardProbes },
        "current",
      ).some((check) => !check.passed),
    );
  }
});
test("a Button outside Card or missing card output fails", () => {
  for (const cards of [
    [],
    cardReport.cards!.map((card) => ({ ...card, buttons: [] })),
  ])
    assert.ok(
      validateRuntime(cardExercise, { ...cardReport, cards }, "current").some(
        (check) => !check.passed,
      ),
    );
});
test("Card must reuse the imported Button rather than copy a button element", () => {
  const files = {
    ...cardExercise.solution,
    [CARD]: cardExercise.solution[CARD].replace(
      'import Button from "./Button";',
      "",
    ).replace(
      "<Button label={buttonLabel} color={color} />",
      "<button style={{ backgroundColor: color }}>{buttonLabel}</button>",
    ),
  };
  const checks = validateSources(cardExercise, files);
  assert.equal(
    checks.find(
      (check) => check.label === "Import and render Button inside Card.tsx",
    )?.passed,
    false,
  );
});
test("saved progress preserves all three Card files and earlier completions", () => {
  const restored = sanitizeProgress({
    version: 1,
    active: "card-lab",
    completed: ["button-lab"],
    drafts: {
      "card-lab": {
        files: cardExercise.solution,
        answers: {},
        viewedSolution: false,
      },
    },
  });
  assert.deepEqual(restored.drafts["card-lab"].files, cardExercise.solution);
  assert.deepEqual(restored.completed, ["button-lab"]);
});

test("adding events and state preserves existing progress and new drafts", () => {
  const exercise = findExercise("like-cards")!;
  const restored = sanitizeProgress({
    version: 1,
    active: exercise.id,
    completed: ["read-props", "card-lab", "event-props", "reset-counter"],
    drafts: {
      [exercise.id]: {
        files: exercise.solution,
        answers: {},
        viewedSolution: false,
      },
    },
  });
  assert.equal(restored.active, exercise.id);
  assert.deepEqual(restored.completed, [
    "read-props",
    "card-lab",
    "event-props",
    "reset-counter",
  ]);
  assert.deepEqual(restored.drafts[exercise.id].files, exercise.solution);
});
