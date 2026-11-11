import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { detail } from "../admin/progress";
import { cardDocument } from "./document";
import { grades, lessonFor, lessons } from "./lessons";
import {
  initialProgress,
  openLesson,
  readProgress,
  starterDraft,
  starterHtml,
} from "./progress";

const document = new JSDOM().window.document;
const sampleImage = "data:image/jpeg;base64,QUJD";

test("card previews and downloads keep the lesson tags and embedded image", () => {
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

test("restored drafts carry across guided lessons and the final project starts with the scaffold", () => {
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
    openLesson(next, "own-project").drafts["own-project"] ?? starterDraft,
    starterDraft,
  );
  const teacher = detail("htmlcss", next, "css-colors");
  assert.equal(teacher.summary.total, 5);
  assert.equal(teacher.summary.completed, 1);
  assert.equal(teacher.selected?.files["index.html"], "<h2>Шатар</h2>");
});

test("blank saved HTML gets a scaffold while its CSS and step survive", () => {
  const progress = readProgress({
    ...initialProgress,
    drafts: {
      "html-tags": {
        files: { "index.html": "\n ", "style.css": ".card { color: blue; }" },
        step: 2,
      },
    },
  });
  assert.deepEqual(progress.drafts["html-tags"], {
    files: { "index.html": starterHtml, "style.css": ".card { color: blue; }" },
    step: 2,
  });
});

test("the scaffold stays empty in the preview until a student adds body content", () => {
  const starter = cardDocument(starterDraft.files, sampleImage, document);
  assert.equal(starter.hasContent, false);
  assert.equal(
    new JSDOM(starter.html).window.document.body.textContent?.trim(),
    "",
  );
  const source = starterHtml.replace(
    "</body>",
    "  <div><h2>Миний карт</h2></div>\n</body>",
  );
  const card = cardDocument(
    { ...starterDraft.files, "index.html": source },
    sampleImage,
    document,
  );
  assert.equal(card.hasContent, true);
  const page = new JSDOM(card.html).window.document;
  assert.equal(
    page.querySelector("body > div > h2")?.textContent,
    "Миний карт",
  );
  assert.equal(page.querySelectorAll("head > title").length, 1);
});
