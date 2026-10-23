import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createCloudProgress, messages } from "./cloud.ts";
const originalFetch = globalThis.fetch;
let clients = [];
beforeEach(() => {
  const data = new Map();
  globalThis.localStorage = {
    get length() {
      return data.size;
    },
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => data.delete(k),
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  };
});
afterEach(() => {
  clients.forEach((c) => c.stop());
  clients = [];
  globalThis.fetch = originalFetch;
});
const client = (course, status) => {
  const c = createCloudProgress(course, status);
  clients.push(c);
  return c;
};
const backups = (base) =>
  Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .filter((key) => key === base || key.startsWith(`${base}:pending:`))
    .map((key) => JSON.parse(localStorage.getItem(key)));
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

test("loads remote progress instead of a stale device copy and isolates courses and IDs", async () => {
  const requests = [];
  globalThis.fetch = async (_, options) => {
    requests.push(JSON.parse(options.body));
    return response({ revision: 7, progress: { completed: ["remote"] } });
  };
  const c = client("python");
  assert.deepEqual(await c.load("001", { completed: ["old"] }), {
    completed: ["remote"],
  });
  c.save({ completed: ["new"] });
  await c.flush();
  assert.equal(requests[1].studentId, "001");
  assert.equal(requests[1].course, "python");
  assert.equal(requests[1].revision, 7);
});
test("an unavailable backend blocks login without uploading a blank local profile", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return response({}, 503);
  };
  await assert.rejects(client("python").load("001", {}));
  assert.equal(calls, 1);
});

test("active exams explain the lesson login block for every course without uploading work", async () => {
  const requests = [];
  globalThis.fetch = async (_, options) => {
    requests.push(JSON.parse(options.body));
    return response({ code: "exam_active" }, 423);
  };
  for (const course of ["python", "javascript", "nextjs"])
    await assert.rejects(
      client(course).load("19S0432", { code: "local draft" }),
      {
        message: messages.examActive,
        status: 423,
      },
    );
  assert.equal(requests.length, 3);
  assert(requests.every((request) => request.action === "load"));
});

test("an exam starting during a lesson preserves unsent work and reports the exam lock", async () => {
  const statuses = [];
  let writes = 0;
  globalThis.fetch = async (_, options) => {
    const body = JSON.parse(options.body);
    if (body.action === "load") return response({ revision: 1, progress: {} });
    writes++;
    return response({ code: "exam_active" }, 423);
  };
  const c = client("python", (status) => statuses.push(status));
  await c.load("19S0432", {});
  c.save({ code: "keep this draft" });
  await c.flush();
  await c.flush();
  assert.equal(writes, 1);
  assert.equal(statuses.at(-1), "examActive");
  assert.equal(
    backups("kodlab:cloud:python:19S0432")[0].pending.code,
    "keep this draft",
  );
});
test("serializes writes while preserving edits made during an in-flight save", async () => {
  let finish;
  const saves = [];
  globalThis.fetch = async (_, options) => {
    const b = JSON.parse(options.body);
    if (b.action === "load") return response({ revision: 1, progress: {} });
    saves.push(b);
    if (saves.length === 1)
      return new Promise((resolve) => {
        finish = () => resolve(response({ revision: 2 }));
      });
    return response({ revision: 3 });
  };
  const c = client("nextjs");
  await c.load("A", {});
  c.save({ code: "first" });
  const saving = c.flush();
  c.save({ code: "latest" });
  finish();
  await saving;
  await c.flush();
  assert.equal(saves.length, 2);
  assert.equal(saves[1].revision, 2);
  assert.equal(saves[1].progress.code, "latest");
});
test("a conflict retains unsent work and never overwrites the other device", async () => {
  const statuses = [];
  let saves = 0;
  globalThis.fetch = async (_, options) => {
    const b = JSON.parse(options.body);
    if (b.action === "load") return response({ revision: 2, progress: {} });
    saves++;
    return response({}, 409);
  };
  const c = client("javascript", (s) => statuses.push(s));
  await c.load("B", {});
  c.save({ code: "keep me" });
  await c.flush();
  await c.flush();
  assert.equal(saves, 1);
  assert.equal(statuses.at(-1), "conflict");
  assert.equal(backups("kodlab:cloud:javascript:B")[0].pending.code, "keep me");
});
test("an unsent backup is recovered only against its original server revision", async () => {
  localStorage.setItem(
    "kodlab:cloud:python:A",
    JSON.stringify({ revision: 3, pending: { code: "offline" } }),
  );
  let writes = 0;
  globalThis.fetch = async (_, options) => {
    const b = JSON.parse(options.body);
    if (b.action === "save") writes++;
    return response({ revision: 4, progress: { code: "newer" } });
  };
  const c = client("python");
  assert.deepEqual(await c.load("A", {}), { code: "offline" });
  c.save({ code: "edited while conflicted" });
  await c.flush();
  assert.equal(writes, 0);
  assert.equal(
    JSON.parse(localStorage.getItem("kodlab:cloud:python:A")).revision,
    3,
  );
  const reopened = client("python");
  await reopened.load("A", {});
  await reopened.flush();
  assert.equal(writes, 0);
});

test("one tab's late acknowledgement preserves another tab's unsent work", async () => {
  let finish;
  globalThis.fetch = async (_, options) => {
    const body = JSON.parse(options.body);
    if (body.action === "load") return response({ revision: 1, progress: {} });
    return new Promise((resolve) => {
      finish = () => resolve(response({ revision: 2 }));
    });
  };
  const first = client("python");
  const second = client("python");
  await first.load("A", {});
  await second.load("A", {});
  first.save({ code: "first tab" });
  const saving = first.flush();
  second.save({ code: "unsent second tab" });
  finish();
  await saving;
  assert.ok(
    [...Array(localStorage.length)].some((_, i) =>
      localStorage.getItem(localStorage.key(i))?.includes("unsent second tab"),
    ),
  );
});

test("corrupt pending backups cannot replace valid server progress", async () => {
  localStorage.setItem(
    "kodlab:cloud:python:A",
    JSON.stringify({ revision: 1, pending: "invalid" }),
  );
  globalThis.fetch = async () =>
    response({ revision: 1, progress: { code: "server" } });
  assert.deepEqual(await client("python").load("A", {}), { code: "server" });
});

test("routine edits save at most once per five seconds and unchanged saves do nothing", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let writes = 0;
  globalThis.fetch = async (_, options) => {
    const body = JSON.parse(options.body);
    if (body.action === "load")
      return response({ revision: 1, progress: { code: "original" } });
    writes++;
    return response({ revision: 1 + writes });
  };
  const c = client("python");
  await c.load("A", {});
  c.save({ code: "original" });
  await c.flush();
  assert.equal(writes, 0);
  for (let i = 0; i < 10; i++) {
    c.save({ code: String(i) });
    t.mock.timers.tick(400);
  }
  assert.equal(writes, 0);
  t.mock.timers.tick(1000);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(writes, 1);
});
