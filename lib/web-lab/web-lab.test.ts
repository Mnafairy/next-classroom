import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { detail } from "../admin/progress";
import { cardDocument } from "./document";
import { grades, lessonFor, lessons } from "./lessons";
import {
  emptyDraft,
  initialProgress,
  openLesson,
  readProgress,
} from "./progress";

const document = new JSDOM().window.document;
const sampleImage = "data:image/jpeg;base64,QUJD";

test("card previews and downloads keep the lesson tags and embedded image", () => {
  const source = cardDocument(
    {
      "index.html":
        '<div class="card" onclick="alert(1)"><h2>Шатрын клуб</h2><p>Тайлбар</p><img src="chess.jpg" alt="Шатрын хөлөг"><img src="https://example.com/a.jpg" srcset="https://example.com/b.jpg"><article><h2>Other tag</h2></article><script>alert(1)</script></div>',
      "style.css": ".card { color: red; } </style><script>alert(1)</script>",
    },
    sampleImage,
    document,
  );
  const page = new JSDOM(source).window.document;
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
  assert.match(
    page.querySelector("style")?.textContent ?? "",
    /\.card \{ color: red; \}/,
  );
});

test("all worked examples use the four teaching tags", () => {
  assert.equal(lessons.length, 5);
  for (const grade of grades) {
    for (const { id } of lessons) {
      const { example } = lessonFor(id, grade);
      const template = document.createElement("template");
      template.innerHTML = example.html;
      for (const tag of template.content.querySelectorAll("*")) {
        assert.ok(
          ["div", "h2", "p", "img"].includes(tag.localName),
          tag.localName,
        );
      }
    }
  }
});

test("restored drafts carry across guided lessons and the final project starts empty", () => {
  const progress = readProgress({
    ...initialProgress,
    grade: 8,
    completed: ["html-tags", "bad"],
    drafts: {
      "html-tags": {
        files: { "index.html": "<h2>Шатар</h2>", "style.css": "" },
        step: 3,
      },
    },
  });
  assert.equal(progress.grade, 8);
  assert.deepEqual(progress.completed, ["html-tags"]);
  assert.equal(progress.drafts["html-tags"]?.step, 3);
  const next = openLesson(progress, "css-colors");
  assert.deepEqual(next.drafts["css-colors"], {
    files: { "index.html": "<h2>Шатар</h2>", "style.css": "" },
    step: 0,
  });
  assert.deepEqual(
    openLesson(next, "own-project").drafts["own-project"] ?? emptyDraft,
    emptyDraft,
  );
  const teacher = detail("htmlcss", next, "css-colors");
  assert.equal(teacher.summary.total, 5);
  assert.equal(teacher.summary.completed, 1);
  assert.equal(teacher.selected?.files["index.html"], "<h2>Шатар</h2>");
});
