import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../../app/api/check/route";
import { readJsonObject } from "./request";

test("the checker rejects malformed origins and non-object JSON without crashing", async () => {
  for (const origin of ["null", "bad-url", "https://other.example"]) {
    const response = await POST(
      new Request("http://localhost/api/check", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    assert.equal(response.status, 403);
  }
  for (const body of ["null", "[]", "invalid"]) {
    const response = await POST(
      new Request("http://localhost/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    );
    assert.equal(response.status, 400);
  }
});

test("oversized streaming requests are cancelled before the full body is read", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(100));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stream,
    duplex: "half",
  } as RequestInit);
  await assert.rejects(
    readJsonObject(request, 150),
    (error: unknown) => error instanceof Response && error.status === 413,
  );
  assert.equal(cancelled, true);
});
