import test from "node:test";
import assert from "node:assert/strict";
import { createRunId } from "./run-id";

test("preview runs work when HTTP does not expose randomUUID", () => {
  const httpCrypto = {
    getRandomValues: crypto.getRandomValues.bind(crypto),
  };
  assert.equal("randomUUID" in httpCrypto, false);
  const ids = Array.from({ length: 100 }, () => createRunId(httpCrypto));
  assert.ok(ids.every((id) => /^[a-f0-9]{32}$/.test(id)));
  assert.equal(new Set(ids).size, ids.length);
});
