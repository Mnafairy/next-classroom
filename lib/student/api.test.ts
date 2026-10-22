import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../../app/api/progress/route";
import { normalizeStudentId } from "./identity";
const request = (body: unknown, headers = {}) =>
  new Request("http://localhost/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
test("IDs preserve leading zeroes and normalize consistently", () => {
  assert.equal(normalizeStudentId(" ００１ "), "001");
  assert.equal(normalizeStudentId("8a-01"), "8A-01");
  for (const value of ["", "../a", "$id", {}, "a b"])
    assert.throws(() => normalizeStudentId(value));
});
test("API rejects malformed input before accessing MongoDB", async () => {
  for (const body of [
    null,
    {},
    { action: "load", course: "bad", studentId: "001" },
    { action: "load", course: "python", studentId: { $ne: null } },
    {
      action: "save",
      course: "python",
      studentId: "001",
      revision: -1,
      progress: {},
    },
  ]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal(
    (await POST(request({}, { Origin: "https://other.example" }))).status,
    403,
  );
  assert.equal(
    (await POST(request({ text: "x".repeat(4 * 1024 * 1024) }))).status,
    413,
  );
});

test("API rejects malformed origins and fake JSON media types", async () => {
  assert.equal((await POST(request({}, { Origin: "null" }))).status, 403);
  assert.equal(
    (await POST(request({}, { "Content-Type": "application/json-fake" })))
      .status,
    415,
  );
});
