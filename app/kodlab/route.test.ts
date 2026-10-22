import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "./route";

for (const origin of [
  "http://localhost:3000",
  "http://192.168.18.1:3000",
  "https://school.example",
]) {
  test(`KodLab entry keeps the student's server origin at ${origin}`, () => {
    const response = GET();
    assert.equal(response.status, 307);
    const destination = new URL(response.headers.get("location")!, origin);
    assert.equal(destination.origin, origin);
    assert.equal(destination.pathname, "/kodlab/index.html");
  });
}
