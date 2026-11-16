import type { CardExercise, Check } from "./lessons";
import { games, type GameId, type GameResult } from "./games";
export type CheckResult = { label: string; passed: boolean };

export function checkGame(game: GameId, result: GameResult): CheckResult[] {
  if ("error" in result) return [{ label: result.error, passed: false }];
  const { rolls, expected } = games[game];
  return expected.flatMap((row, choice) =>
    row.map((answer, roll) => ({
      label: rolls.length
        ? `${rolls[choice]} / ${rolls[roll]} → ${answer}`
        : `roll = ${roll + 1} → ${answer}`,
      passed: result.answers[choice]?.[roll] === answer,
    })),
  );
}

export function checkExercise(
  exercise: CardExercise,
  document: Document,
): CheckResult[] {
  return exercise.checks.map((check: Check) => {
    if (check.kind === "count") {
      return {
        label: check.label,
        passed:
          document.querySelectorAll(check.selector).length === check.value,
      };
    }
    const element = document.querySelector(check.selector);
    if (!element) return { label: check.label, passed: false };
    let passed = false;
    switch (check.kind) {
      case "element":
        passed = true;
        break;
      case "text":
        passed =
          element.textContent?.trim().replace(/\s+/g, " ") === check.value;
        break;
      case "content":
        passed = Boolean(element.textContent?.trim());
        break;
      case "image": {
        const ImageElement = document.defaultView?.HTMLImageElement;
        passed = Boolean(
          ImageElement &&
          element instanceof ImageElement &&
          element.complete &&
          element.naturalWidth > 0 &&
          element.alt.trim(),
        );
        break;
      }
      case "style":
        passed =
          document.defaultView
            ?.getComputedStyle(element)
            .getPropertyValue(check.property) === check.value;
        break;
      case "style-not": {
        const value = document.defaultView
          ?.getComputedStyle(element)
          .getPropertyValue(check.property);
        passed = Boolean(value && value !== check.value);
        break;
      }
      default: {
        const exhaustive: never = check;
        throw new Error(`Unknown check ${exhaustive}`);
      }
    }
    return { label: check.label, passed };
  });
}
