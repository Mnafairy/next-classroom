import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { detail } from "../admin/progress";
import { cardDocument } from "./document";
import { checkExercise } from "./checks";
import { exercises, lessons, pageFiles, starterHtml } from "./lessons";
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
  assert.equal(page.querySelectorAll("img[src], img[srcset]").length, 1);
  assert.equal(page.querySelector("script"), null);
});

test("all exercises have a real starter page and card examples use only the teaching tags", () => {
  assert.equal(lessons.length, 5);
  assert.equal(exercises.length, 13);
  for (const exercise of exercises) {
    assert.match(exercise.starter["index.html"], /<!doctype html>/i);
    const rendered = cardDocument(exercise.solution, sampleImage, document);
    for (const node of new JSDOM(
      rendered.html,
    ).window.document.body.querySelectorAll("*")) {
      assert.ok(["div", "h2", "p", "img"].includes(node.localName));
    }
    assert.doesNotMatch(
      exercise.solution["style.css"],
      /@media|display:\s*(flex|grid)/,
    );
  }
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
  assert.equal(teacher.summary.total, 13);
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
