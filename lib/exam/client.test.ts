import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { examFetch, ExamSessionExpiredError } from "./client";

test("exam login retries a temporary HTTP failure against a real server", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  const server = createServer((request, response) => {
    assert.equal(request.url, "/api/exam");
    calls++;
    response.writeHead(calls === 1 ? 503 : 200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify(
        calls === 1 ? { error: "Temporary connection failure" } : { ok: true },
      ),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing HTTP test port");
  globalThis.fetch = (input, options) =>
    originalFetch(
      new URL(String(input), `http://127.0.0.1:${address.port}`),
      options,
    );
  try {
    const result = await examFetch({ action: "start", studentId: "TEST" });
    assert.equal(result.status, 200);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("login recovers once from a browser timeout and gives a readable error if both fail", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) throw new DOMException("signal timed out", "TimeoutError");
    return Response.json({ ok: true });
  };
  try {
    assert.equal(
      (await examFetch({ action: "start", studentId: "TEST" })).status,
      200,
    );
    assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      throw new DOMException("signal timed out", "TimeoutError");
    };
    await assert.rejects(
      () => examFetch({ action: "start", studentId: "TEST" }),
      /Шалгалтын холболт удааширлаа/,
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("permission failures are not retried, and saves never repeat after an unknown write outcome", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return Response.json({ error: "Сурагч бүртгэлгүй" }, { status: 403 });
    };
    await assert.rejects(
      () => examFetch({ action: "start", studentId: "UNKNOWN" }),
      /Сурагч бүртгэлгүй/,
    );
    assert.equal(calls, 1);
    globalThis.fetch = async () =>
      Response.json(
        { code: "exam_reset", error: "Дахин нэвтэрнэ үү." },
        { status: 409 },
      );
    await assert.rejects(
      () => examFetch({ action: "save", revision: 0 }),
      ExamSessionExpiredError,
    );
    globalThis.fetch = async () =>
      Response.json({ error: "Дахин нэвтэрнэ үү." }, { status: 401 });
    await assert.rejects(
      () => examFetch({ action: "save", revision: 0 }),
      ExamSessionExpiredError,
    );
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      throw new TypeError("Failed to fetch");
    };
    await assert.rejects(
      () => examFetch({ action: "save", revision: 0 }),
      /сервертэй холбогдсонгүй/,
    );
    assert.equal(calls, 1);
    calls = 0;
    await assert.rejects(
      () => examFetch({ action: "submit", revision: 0 }),
      /сервертэй холбогдсонгүй/,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
