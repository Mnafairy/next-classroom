import test from "node:test";
import assert from "node:assert/strict";
import { catalog, detail, parseProgress, summarize } from "./progress";
import { questions } from "../python/questions";
import { csvCell } from "../../components/admin/api";
import { hashPassword, verifyPassword, isAdmin } from "./auth";
import {
  GET as rosterGET,
  POST as rosterPOST,
} from "../../app/api/admin/route";
import { GET as detailGET } from "../../app/api/admin/student/route";
import { POST as loginPOST } from "../../app/api/admin/session/route";

test("admin summaries deduplicate completion, reject invented IDs, and exclude assisted work", () => {
  for (const course of ["python", "javascript", "nextjs"] as const) {
    const [first, second] = catalog[course];
    const summary = summarize(course, {
      completed: [first.id, first.id, second.id, "invented"],
      assisted: [second.id],
      drafts: {
        [first.id]: course === "javascript" ? "code" : { code: "code" },
        [second.id]: { viewedSolution: true },
      },
    });
    assert.equal(summary.completed, 1);
    assert.equal(summary.assisted, 1);
    assert.equal(summary.attempted, 2);
    assert.equal(summary.total, catalog[course].length);
  }
});
test("Python quiz scores are recomputed from known questions, not a student supplied score", () => {
  const answers = Object.fromEntries(questions.map((q) => [q.id, q.answer]));
  const result = summarize("python", {
    quizAttempts: {
      all: { submitted: true, answers, score: -999 },
      bogus: { submitted: true, answers },
    },
  });
  assert.equal(result.quizzes.length, 1);
  assert.equal(result.quizzes[0].correct, questions.length);
});
test("details return only the selected known exercise and render saved strings as data", () => {
  const [first, second] = catalog.nextjs;
  const code = '<script>alert("untrusted")</script>';
  const result = detail(
    "nextjs",
    {
      active: first.id,
      drafts: {
        [first.id]: {
          files: { "/app/page.tsx": code },
          answers: { q: "answer" },
        },
        [second.id]: { files: { "secret.tsx": "other exercise" } },
      },
    },
    first.id,
  );
  assert.equal(result.selected?.files["/app/page.tsx"], code);
  assert.equal(result.selected?.files["secret.tsx"], undefined);
  assert.equal(result.selected?.answers.q, "answer");
  assert.equal(detail("nextjs", {}, "bad").selected?.id, first.id);
  assert.deepEqual(parseProgress("{broken"), {});
});
test("CSV cells neutralize spreadsheet formulas and quote embedded text", () => {
  for (const value of ["=SUM(1,2)", " +1", "-1", "@SUM(1,2)", "\t=1"])
    assert.ok(csvCell(value).startsWith("\"'"));
  assert.equal(csvCell("10A-01"), '"10A-01"');
  assert.equal(csvCell('A"B'), '"A""B"');
});
test("password hashing has unique salts, constant-sized derived keys, and rejects malformed hashes", async () => {
  const a = await hashPassword("a sufficiently long test password"),
    b = await hashPassword("a sufficiently long test password");
  assert.notEqual(a, b);
  assert.equal(
    await verifyPassword("a sufficiently long test password", a),
    true,
  );
  assert.equal(await verifyPassword("wrong", a), false);
  assert.equal(await verifyPassword({}, a), false);
  assert.equal(await verifyPassword("test", "bad"), false);
  assert.equal(await isAdmin("forged"), false);
});
test("all admin data endpoints reject unauthenticated requests and cross-origin writes", async () => {
  assert.equal(
    (await rosterGET(new Request("https://example.test/api/admin"))).status,
    401,
  );
  assert.equal(
    (
      await detailGET(
        new Request(
          "https://example.test/api/admin/student?studentId=001&course=python",
        ),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await rosterPOST(
        new Request("https://example.test/api/admin", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await loginPOST(
        new Request("https://example.test/api/admin/session", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      )
    ).status,
    403,
  );
});
