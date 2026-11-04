import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../../app/api/check/route";
import { readJsonObject, sameOrigin } from "./request";

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

test("checker blocks import-equals before resolving a server file", async () => {
  const { exercises, PAGE } = await import("../course/lessons");
  const ex = exercises.find((e) => e.kind === "code" && PAGE in e.starter)!;
  const files = {
    ...ex.solution,
    [PAGE]:
      'import type server = require("../../lib/admin/accounts");\n' +
      ex.solution[PAGE],
  };
  const res = await POST(
    new Request("http://school.test/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: ex.id, files }),
    }),
  );
  const { checks } = await res.json();
  assert.equal(checks[0].passed, false);
  assert.match(checks[0].detail, /direct imports/);
});

test("wildcard binding uses the visible host, port and scheme for browser writes", () => {
  const check = (host: string, origin: string, site = "same-origin") =>
    sameOrigin(
      new Request("http://0.0.0.0:3000/api/exam", {
        headers: {
          host,
          origin,
          "sec-fetch-site": site,
          "x-forwarded-host": "foreign.test",
        },
      }),
    );
  assert(check("192.168.18.3:3000", "http://192.168.18.3:3000"));
  assert(check("school.test", "http://school.test"));
  assert(!check("school.test", "https://school.test"));
  assert(!check("school.test", "http://foreign.test"));
  assert(!check("school.test", "http://school.test", "cross-site"));
});
