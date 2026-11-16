import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { detail } from "../admin/progress";
import { cardDocument } from "./document";
import { checkExercise, checkGame } from "./checks";
import { connectGame, evaluateGame, games } from "./games";
import {
  exercises,
  findExercise,
  lessons,
  pageFiles,
  starterHtml,
} from "./lessons";
import {
  exerciseDraft,
  initialProgress,
  readProgress,
  starterFiles,
} from "./progress";

const document = new JSDOM().window.document;
const sampleImage = "data:image/jpeg;base64,QUJD";

test("preview and downloads retain the four lesson tags and embedded image while excluding executable markup", () => {
  const { html, hasContent } = cardDocument(
    {
      "index.html":
        '<div class="card" onclick="alert(1)"><h2>Шатрын клуб</h2><p>Тайлбар</p><img src="chess.jpg" alt="Шатрын хөлөг"><img src="https://example.com/a.jpg" srcset="https://example.com/b.jpg"><article><h2>Other tag</h2></article><script>alert(1)</script></div>',
      "style.css": ".card { color: red; } </style><script>alert(1)</script>",
    },
    sampleImage,
    document,
  );
  assert.equal(hasContent, true);
  const page = new JSDOM(html).window.document;
  assert.deepEqual(
    [...page.body.querySelectorAll("*")].map((node) => node.localName),
    ["div", "h2", "p", "img", "img"],
  );
  assert.equal(page.querySelector(".card")?.getAttribute("onclick"), null);
  assert.equal(page.querySelector("h2")?.textContent, "Шатрын клуб");
  assert.equal(page.querySelector("img")?.getAttribute("src"), sampleImage);
  assert.equal(page.querySelector("img")?.alt, "Шатрын хөлөг");
  assert.deepEqual(
    [...page.querySelectorAll("img[src]")].map((image) =>
      image.getAttribute("src"),
    ),
    [sampleImage, "https://example.com/a.jpg"],
  );
  assert.equal(page.querySelector("img[srcset]"), null);
  assert.equal(page.querySelector("script"), null);
});

test("image sources accept direct HTTPS and embedded raster images", () => {
  const images = [
    "./chess.jpg",
    "data:image/png;base64,QUJD",
    "https://example.com/photo.png",
    "http://example.com/photo.png",
    "file:///photo.png",
    "javascript:alert(1)",
  ];
  const { html } = cardDocument(
    pageFiles(images.map((src) => `<img src="${src}" alt="Зураг">`).join("\n")),
    sampleImage,
    document,
  );
  const preview = new JSDOM(html).window.document;
  assert.deepEqual(
    [...preview.querySelectorAll("img")].map((image) =>
      image.getAttribute("src"),
    ),
    [sampleImage, images[1], images[2], null, null, null],
  );
});

test("all exercises have a real starter page and examples use only the teaching tags", () => {
  assert.equal(lessons.length, 7);
  assert.equal(exercises.length, 29);
  for (const exercise of exercises) {
    assert.match(exercise.starter["index.html"], /<!doctype html>/i);
    if (exercise.topic === "mini-games") continue;
    const rendered = cardDocument(exercise.solution, sampleImage, document);
    for (const node of new JSDOM(
      rendered.html,
    ).window.document.body.querySelectorAll("*")) {
      assert.ok(["div", "h2", "p", "img", "button"].includes(node.localName));
    }
    assert.doesNotMatch(
      exercise.solution["style.css"],
      /@media|display:\s*(flex|grid)/,
    );
  }
});

test("choice games teach HTML, CSS, and JavaScript in order and retain existing submissions", () => {
  const ids = ["coin-toss", "rock-paper-scissors"] as const;
  const files = pageFiles(
    "<h2>Миний тоглоом</h2>",
    ".game { color: blue; }",
    'return "Миний хариу";',
  );
  const progress = readProgress({
    ...initialProgress,
    active: ids[1],
    completed: ids,
    drafts: { [ids[0]]: { files }, [ids[1]]: { files } },
  });
  assert.equal(progress.active, ids[1]);
  assert.deepEqual(progress.completed, ids);

  for (const id of ids) {
    const index = exercises.findIndex((exercise) => exercise.id === id);
    const steps = exercises
      .slice(index - 2, index + 1)
      .map(({ id }) => findExercise(id));
    assert.deepEqual(
      steps.map(({ id }) => id),
      [`${id}-html`, `${id}-css`, id],
    );
    assert.deepEqual(
      steps.map(({ file }) => file),
      ["index.html", "style.css", "answer.js"],
    );
    assert.deepEqual(
      steps.map(({ game }) => game),
      [undefined, undefined, id],
    );
    assert.equal(
      steps[1].starter["index.html"],
      steps[0].solution["index.html"],
    );
    assert.deepEqual(
      { ...steps[2].starter, "answer.js": undefined },
      { ...steps[1].solution, "answer.js": undefined },
    );
    assert.deepEqual(exerciseDraft(progress, id).files, files);
  }
});

test("game solutions pass their layout and all outcomes, and starters need work", async () => {
  const render = (files: ReturnType<typeof pageFiles>) =>
    new JSDOM(cardDocument(files, sampleImage, document).html).window.document;
  for (const { id } of exercises.filter(
    ({ topic }) => topic === "mini-games",
  )) {
    const exercise = findExercise(id);
    const checks = checkExercise(exercise, render(exercise.solution));
    const starter = checkExercise(exercise, render(exercise.starter));
    if (exercise.game) {
      const solution = await evaluateGame(
        exercise.game,
        exercise.solution["answer.js"] ?? "",
      );
      assert.deepEqual(solution, { answers: games[exercise.game].expected });
      checks.push(...checkGame(exercise.game, solution));
      starter.push(
        ...checkGame(
          exercise.game,
          await evaluateGame(
            exercise.game,
            exercise.starter["answer.js"] ?? "",
          ),
        ),
      );
    }
    assert.deepEqual(
      checks.filter(({ passed }) => !passed),
      [],
      id,
    );
    assert.ok(
      starter.some(({ passed }) => !passed),
      id,
    );
  }
});

test("the eight ball uses the supplied controls, preserves drafts and plays in a standalone download", async () => {
  const exercise = findExercise("eight-ball-logic");
  const progress = readProgress({
    ...initialProgress,
    drafts: { [exercise.id]: { files: exercise.solution } },
  });
  const files = exerciseDraft(progress, exercise.id).files;
  assert.equal(
    detail("htmlcss", progress, exercise.id).selected?.files["answer.js"],
    files["answer.js"],
  );
  const answers = await evaluateGame("eight-ball", files["answer.js"] ?? "");
  assert.ok("answers" in answers);
  const preview = new JSDOM(cardDocument(files, sampleImage, document).html);
  connectGame(preview.window.document, answers.answers, []);
  const download = new JSDOM(
    cardDocument(
      {
        ...files,
        "index.html": files["index.html"].replace(
          'type="text"',
          'type="password" onfocus="alert(1)"',
        ),
      },
      sampleImage,
      document,
      { id: "eight-ball", answers: answers.answers },
    ).html,
    { runScripts: "dangerously" },
  );
  for (const { window } of [preview, download]) {
    const question = window.document.querySelector("input");
    const button = window.document.querySelector("button");
    const answer = window.document.querySelector(".answer");
    assert.ok(question && button && answer);
    assert.equal(question.type, "text");
    assert.equal(question.getAttribute("onfocus"), null);
    button.click();
    assert.equal(answer.textContent, "Асуултаа бичээрэй.");
    question.value = "Өнөөдөр азтай өдөр үү?";
    question.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Enter" }),
    );
    assert.ok(answers.answers[0].includes(answer.textContent ?? ""));
    window.close();
  }
  assert.ok("error" in (await evaluateGame("eight-ball", "return 'Тийм!';")));
  assert.ok(
    "error" in
      (await evaluateGame(
        "eight-ball",
        "if (true) { while (true) {} } else { return ''; }",
      )),
  );
});

test("button exercises build on the previous step and check three differently styled classes", () => {
  const steps = exercises.filter(({ topic }) => topic === "button-classes");
  assert.equal(steps.length, 7);
  const render = (files: ReturnType<typeof pageFiles>) =>
    new JSDOM(cardDocument(files, sampleImage, document).html).window.document;

  for (const [index, exercise] of steps.entries()) {
    if (index > 0 && exercise.id !== "button-gallery")
      assert.deepEqual(exercise.starter, steps[index - 1].solution);
    const failed = checkExercise(exercise, render(exercise.solution)).filter(
      ({ passed }) => !passed,
    );
    assert.deepEqual(failed, [], exercise.id);
    assert.ok(
      checkExercise(exercise, render(exercise.starter)).some(
        ({ passed }) => !passed,
      ),
      exercise.id,
    );
  }

  const final = steps.find(({ id }) => id === "button-gallery");
  assert.ok(final);
  const buttons = [...render(final.solution).querySelectorAll("button")];
  assert.deepEqual(
    buttons.map(({ textContent, className }) => [textContent, className]),
    [
      ["Эхлэх", "btn-1"],
      ["Дэлгэрэнгүй", "btn-2"],
      ["Хадгалах", "btn-3"],
    ],
  );

  const wrong = render({
    ...final.solution,
    "index.html": final.solution["index.html"].replace(
      'class="btn-3"',
      'class="btn-1" onclick="alert(1)"',
    ),
  });
  assert.equal(wrong.querySelector("[onclick]"), null);
  assert.ok(checkExercise(final, wrong).some(({ passed }) => !passed));
  const extra = render({
    ...final.solution,
    "index.html": final.solution["index.html"].replace(
      "</body>",
      "<button>Илүү товч</button></body>",
    ),
  });
  assert.equal(checkExercise(final, extra)[0].passed, false);
});

test("old lesson drafts migrate to the matching exercise with their exact code", () => {
  const code = '<div class="card"><h2>Миний клуб</h2></div>';
  const progress = readProgress({
    version: 1,
    grade: 8,
    active: "html-tags",
    completed: ["css-colors"],
    drafts: {
      "html-tags": {
        files: { "index.html": code, "style.css": ".card { color: blue; }" },
        step: 3,
      },
      "card-layout": {
        files: {
          "index.html": code,
          "style.css": ".gallery { display: grid; }",
        },
        step: 0,
      },
    },
  });
  assert.equal(progress.version, 2);
  assert.equal(progress.active, "card-image");
  assert.equal(progress.drafts["card-image"]?.files["index.html"], code);
  assert.equal(
    progress.drafts["card-image"]?.files["style.css"],
    ".card { color: blue; }",
  );
  assert.equal(
    progress.drafts["image-width"]?.files["style.css"],
    ".gallery { display: grid; }",
  );
  assert.deepEqual(progress.completed, [
    "card-background",
    "card-text-color",
    "card-font-size",
  ]);
  const teacher = detail("htmlcss", progress, "card-image");
  assert.equal(teacher.summary.total, exercises.length);
  assert.equal(teacher.selected?.files["index.html"], code);
});

test("new and previously blank projects receive scaffolds while independent exercises keep their own starters", () => {
  assert.equal(
    exerciseDraft(initialProgress, "card-title").files["index.html"],
    starterHtml,
  );
  assert.match(
    exerciseDraft(initialProgress, "card-image").files["index.html"],
    /<p>Баасан гараг бүр уулздаг\.<\/p>/,
  );
  const restored = readProgress({
    version: 1,
    active: "html-tags",
    drafts: {
      "html-tags": {
        step: 0,
        files: { "index.html": "", "style.css": "p { color: blue; }" },
      },
    },
  });
  assert.equal(
    restored.drafts["card-wrapper"]?.files["index.html"],
    exercises.find(({ id }) => id === "card-wrapper")?.starter["index.html"],
  );
  assert.equal(
    restored.drafts["card-wrapper"]?.files["style.css"],
    "p { color: blue; }",
  );
  assert.equal(
    cardDocument(starterFiles, sampleImage, document).hasContent,
    false,
  );
});

test("restoring assisted progress excludes it from completion and keeps the free-code draft", () => {
  const progress = readProgress({
    ...initialProgress,
    active: "bad",
    completed: ["card-title", "card-title", "bad"],
    drafts: {
      "card-title": {
        files: pageFiles("<h2>Шатрын клуб</h2>"),
        viewedSolution: true,
      },
    },
    playground: pageFiles("<h2>Чөлөөт код</h2>"),
  });
  assert.equal(progress.active, "card-title");
  assert.deepEqual(progress.completed, []);
  assert.match(progress.playground["index.html"], /Чөлөөт код/);
  assert.equal(detail("htmlcss", progress, "card-title").summary.assisted, 1);
});

test("HTML checking reads actual elements rather than comments and catches incorrect content", () => {
  const exercise = exercises[0];
  const render = (html: string) =>
    new JSDOM(cardDocument(pageFiles(html), sampleImage, document).html).window
      .document;
  assert.ok(
    checkExercise(exercise, render("<h2>Шатрын клуб</h2>")).every(
      ({ passed }) => passed,
    ),
  );
  assert.ok(
    checkExercise(exercise, render("<!-- <h2>Шатрын клуб</h2> -->")).every(
      ({ passed }) => !passed,
    ),
  );
  assert.ok(
    checkExercise(exercise, render("<p>Шатрын клуб</p>")).every(
      ({ passed }) => !passed,
    ),
  );
  assert.ok(
    checkExercise(exercise, render("<h2>Өөр нэр</h2>")).every(
      ({ passed }) => !passed,
    ),
  );
});
