import type { CheckResult, Exercise, RuntimeReport } from "./types";
import { cardProbeProps } from "./sandbox";

export function normalizedColor(color: string) {
  const value = color.toLowerCase().replace(/\s/g, "");
  const named: Record<string, string> = {
    blue: "rgb(0,0,255)",
    red: "rgb(255,0,0)",
    green: "rgb(0,128,0)",
    white: "rgb(255,255,255)",
  };
  if (named[value]) return named[value];
  if (/^#[\da-f]{6}$/.test(value))
    return `rgb(${parseInt(value.slice(1, 3), 16)},${parseInt(value.slice(3, 5), 16)},${parseInt(value.slice(5, 7), 16)})`;
  return value;
}
export function validateRuntime(
  exercise: Exercise,
  report: RuntimeReport,
  expectedRunId: string,
): CheckResult[] {
  if (report.runId !== expectedRunId)
    return [
      {
        label: "Check the current code",
        passed: false,
        detail:
          "This result belongs to an older run. Run your current code again.",
      },
    ];
  if (report.error)
    return [
      { label: "Render without errors", passed: false, detail: report.error },
    ];
  const expected = exercise.expected ?? [];
  const checks: CheckResult[] = [
    {
      label: `Render ${expected.length} button${expected.length === 1 ? "" : "s"}`,
      passed: report.buttons.length === expected.length,
    },
    {
      label: "Display the requested labels in order",
      passed: expected.every(
        (button, i) => report.buttons[i]?.text === button.label,
      ),
    },
  ];
  if (expected.some((button) => button.color))
    checks.push({
      label: "Use the requested background colors",
      passed: expected.every(
        (button, i) =>
          normalizedColor(report.buttons[i]?.background ?? "") ===
          normalizedColor(button.color),
      ),
    });
  if (exercise.styled) {
    checks.push({
      label: "Keep white text and 12px 24px padding",
      passed:
        report.buttons.length > 0 &&
        report.buttons.every(
          (button) =>
            normalizedColor(button.color) === normalizedColor("white") &&
            button.padding === "12px 24px",
        ),
    });
  }
  if (exercise.props)
    checks.push({
      label: "Read each label from props",
      passed:
        report.probes[0]?.[0]?.text === "A fresh label" &&
        report.probes[1]?.[0]?.text === "Another label",
      detail:
        "Your component must also work with new labels, not just the example text.",
    });
  if (exercise.props === "color")
    checks.push({
      label: "Let the color prop control the inline background",
      passed: ["blue", "red", "green"].every(
        (color, index) =>
          normalizedColor(report.probes[index]?.[0]?.background ?? "") ===
          normalizedColor(color),
      ),
      detail:
        "The same component should respond to blue, red, and a new color.",
    });
  if (exercise.expectedCards) {
    const cards = report.cards ?? [];
    checks.push({
      label: `Render ${exercise.expectedCards.length} card${exercise.expectedCards.length === 1 ? "" : "s"} with the requested content`,
      passed:
        cards.length === exercise.expectedCards.length &&
        exercise.expectedCards.every(
          (expectedCard, i) =>
            cards[i]?.title === expectedCard.title &&
            cards[i]?.description === expectedCard.description,
        ),
    });
    checks.push({
      label: "Place each Button inside its Card",
      passed: exercise.expectedCards.every(
        (expectedCard, i) =>
          cards[i]?.buttons.length === 1 &&
          cards[i]?.buttons[0]?.text === expectedCard.buttonLabel &&
          normalizedColor(cards[i]?.buttons[0]?.background ?? "") ===
            normalizedColor(expectedCard.color),
      ),
    });
  }
  if (exercise.cardProps) {
    checks.push({
      label: "Read Card title and description from props",
      passed: cardProbeProps.every((props, i) => {
        const cards = report.cardProbes?.[i];
        return (
          cards?.length === 1 &&
          cards[0].title === props.title &&
          cards[0].description === props.description
        );
      }),
      detail: "Card must also display new titles and descriptions.",
    });
    checks.push({
      label: "Pass Card props onward to Button",
      passed: cardProbeProps.every((props, i) => {
        const buttons = report.cardProbes?.[i]?.[0]?.buttons;
        return (
          buttons?.length === 1 &&
          buttons[0].text === props.buttonLabel &&
          normalizedColor(buttons[0].background) ===
            normalizedColor(props.color)
        );
      }),
      detail:
        "Forward buttonLabel to Button's label prop, and color to its color prop.",
    });
  }
  if (exercise.interactions) {
    checks.push({
      label: "Wait for a click before running an action",
      passed: report.initialInteraction?.alerts.length === 0,
      detail: "Pass the handler function; do not call it while rendering.",
    });
    if (exercise.initialText)
      checks.push({
        label: `Start with ${exercise.initialText}`,
        passed: report.initialInteraction?.text.trim() === exercise.initialText,
      });
    checks.push({
      label: "Check every requested click",
      passed: report.interactions?.length === exercise.interactions.length,
    });
    exercise.interactions.forEach((step, index) => {
      const actual = report.interactions?.[index];
      const output =
        step.text ??
        step.labels?.join(" · ") ??
        step.alerts?.join(" · ") ??
        "the requested result";
      checks.push({
        label: `Click ${index + 1}: button ${step.button + 1} → ${output}`,
        passed:
          !!actual &&
          JSON.stringify(actual.alerts) === JSON.stringify(step.alerts ?? []) &&
          (!step.text || actual.text.trim() === step.text) &&
          (!step.labels ||
            JSON.stringify(actual.buttons.map((button) => button.text)) ===
              JSON.stringify(step.labels)),
        detail:
          "Your component must keep working across repeated clicks, resets, and clicks on different instances.",
      });
    });
  }
  if (exercise.forwardClick) {
    checks.push({
      label: "Let Button call the function passed through onClick",
      passed:
        report.buttonClickCalls?.length === 3 &&
        report.buttonClickCalls.every((calls) => calls === 1),
      detail:
        "A new onClick function must run exactly once when Button is clicked.",
    });
    if (exercise.forwardClick === "card")
      checks.push({
        label: "Forward a new click handler through Card",
        passed:
          report.cardClickCalls?.length === cardProbeProps.length &&
          report.cardClickCalls.every((calls) => calls === 1),
        detail: "Card must forward the onClick prop it receives to Button.",
      });
  }
  return checks;
}
