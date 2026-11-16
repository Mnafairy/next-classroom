export const games = {
  "eight-ball": {
    rolls: [],
    expected: [["Тийм!", "Магадгүй.", "Үгүй."]],
  },
  "coin-toss": {
    rolls: ["Сүлд", "Тоо"],
    expected: [
      ["Таалаа!", "Таасангүй."],
      ["Таасангүй.", "Таалаа!"],
    ],
  },
  "rock-paper-scissors": {
    rolls: ["Чулуу", "Даавуу", "Хайч"],
    expected: [
      ["Тэнцлээ.", "Хожигдлоо.", "Хожлоо!"],
      ["Хожлоо!", "Тэнцлээ.", "Хожигдлоо."],
      ["Хожигдлоо.", "Хожлоо!", "Тэнцлээ."],
    ],
  },
} as const;

export type GameId = keyof typeof games;
export type GameResult = { answers: string[][] } | { error: string };

export async function evaluateGame(
  game: GameId,
  code: string,
): Promise<GameResult> {
  try {
    const { runAnswerCode } = await import("../exam/interpreter");
    return {
      answers: games[game].expected.map((row, choice) =>
        row.map((_, roll) =>
          runAnswerCode(code, { choice: choice + 1, roll: roll + 1 }),
        ),
      ),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Кодоо шалгаарай.",
    };
  }
}

export function connectGame(
  document: Document,
  answers: readonly (readonly string[])[],
  rolls: readonly string[],
) {
  const answer = document.querySelector(".game .answer");
  const question = document.querySelector<HTMLInputElement>(
    ".game input.question",
  );
  const choice = document.querySelector<HTMLSelectElement>(
    ".game select.choice",
  );
  const button = document.querySelector<HTMLButtonElement>(".game button.play");
  const result = document.querySelector(".game .roll-result");
  if (!answer || !button || (!question && !choice)) return;

  button.addEventListener("click", () => {
    answer.setAttribute("data-answered", "");
    if (question && !question.value.trim()) {
      answer.textContent = "Асуултаа бичээрэй.";
      question.focus();
      return;
    }
    const row = answers[choice ? Number(choice.value) - 1 : 0];
    const roll = Math.floor(Math.random() * (rolls.length || 3));
    if (result) result.textContent = rolls[roll] || "";
    answer.textContent = row?.[roll] || "Хариугаа return ашиглан буцаагаарай.";
  });

  answer.setAttribute("aria-live", "polite");
  question?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) button.click();
  });
}
