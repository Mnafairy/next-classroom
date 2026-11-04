import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  ExamAnswerConflictError,
  mergeExamAnswers,
  saveExamAnswers,
} from "./sync";
import { ExamSessionExpiredError } from "./client";
import type { ExamView } from "./types";

test("answer reconciliation preserves different questions and code, but refuses competing edits", () => {
  const base = { choices: { q01: 0 }, code: { c01: "starter" } };
  const local = { choices: { q01: 0, q16: 2 }, code: { c01: "my code" } };
  const remote = { choices: { q01: 1, q10: 3 }, code: { c01: "starter" } };
  assert.deepEqual(mergeExamAnswers(base, local, remote), {
    choices: { q01: 1, q10: 3, q16: 2 },
    code: { c01: "my code" },
  });
  assert.throws(
    () =>
      mergeExamAnswers(base, local, { ...remote, code: { c01: "other code" } }),
    ExamAnswerConflictError,
  );
});

test("stale tabs and lost save acknowledgments recover without overwriting answers or submitting a reset attempt", async () => {
  const initial: ExamView = {
    studentId: "TEST",
    name: "Test",
    className: "8А",
    generation: 0,
    status: "active",
    deadline: new Date(Date.now() + 60000).toISOString(),
    revision: 0,
    departures: 0,
    answers: { choices: {}, code: {} },
    questions: [],
    exercises: [],
  };
  let saved = structuredClone(initial),
    posts = 0,
    gets = 0;
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    if (request.method === "GET") {
      gets++;
      response.end(JSON.stringify({ attempt: saved, serverNow: Date.now() }));
      return;
    }
    posts++;
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw);
    if (body.revision !== saved.revision) {
      response.writeHead(409);
      response.end(JSON.stringify({ error: "revision conflict" }));
      return;
    }
    saved = {
      ...saved,
      revision: saved.revision + 1,
      answers: { choices: body.choices, code: body.code },
      status: "active",
    };
    response.end(
      JSON.stringify({
        attempt:
          body.action === "submit"
            ? {
                studentId: saved.studentId,
                name: saved.name,
                className: saved.className,
                generation: saved.generation,
                status: "submitted",
              }
            : saved,
        serverNow: Date.now(),
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing test port");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, options) =>
    originalFetch(
      new URL(String(input), `http://127.0.0.1:${address.port}`),
      options,
    );
  try {
    assert.equal(await saveExamAnswers(initial, initial.answers, false), null);
    assert.equal(posts, 0, "An unchanged tab must never write");
    const tab1 = await saveExamAnswers(
      initial,
      { choices: { q10: 2 }, code: {} },
      false,
    );
    assert(tab1?.attempt);
    const tab2 = await saveExamAnswers(
      initial,
      { choices: { q16: 1 }, code: {} },
      false,
    );
    assert(tab2?.attempt?.status === "active");
    assert.deepEqual(tab2.attempt.answers.choices, { q10: 2, q16: 1 });
    const postsBeforeRetry = posts;
    const retry = await saveExamAnswers(
      initial,
      { choices: { q10: 2 }, code: {} },
      false,
    );
    assert(retry?.attempt?.status === "active");
    assert.equal(retry.attempt.revision, saved.revision);
    assert.equal(
      posts,
      postsBeforeRetry + 1,
      "Lost acknowledgment requires no duplicate database write",
    );
    await assert.rejects(
      () => saveExamAnswers(initial, { choices: { q10: 3 }, code: {} }, false),
      ExamAnswerConflictError,
    );
    assert.equal(saved.answers.choices.q10, 2);
    const current = structuredClone(saved);
    const final = await saveExamAnswers(current, current.answers, true);
    assert.equal(
      final?.attempt?.status,
      "submitted",
      "Submit still runs with unchanged answers",
    );
    saved = { ...saved, status: "active", generation: 1, revision: 5 };
    await assert.rejects(
      () => saveExamAnswers(initial, { choices: { q02: 1 }, code: {} }, true),
      ExamSessionExpiredError,
    );
    assert.equal(saved.answers.choices.q02, undefined);
    assert(gets > 0);
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
