import test from "node:test";
import assert from "node:assert/strict";
import {
  oneEditAway,
  correctionCandidate,
  mergeJavascriptWork,
} from "./reconcile";
test("roster typos: insertion, deletion, letter replacement and swaps; ambiguous IDs stay unresolved", () => {
  assert.equal(oneEditAway("19S0209S", "19S0209"), true);
  assert.equal(oneEditAway("19S209", "19S0209"), true);
  assert.equal(oneEditAway("20Ы0227", "20S0227"), true);
  assert.equal(oneEditAway("19S0217", "19S0127"), true);
  assert.equal(oneEditAway("1", "19S0209"), false);
  assert.equal(oneEditAway("ABCD", "AXYD"), false);
  assert.equal(correctionCandidate("19S067", ["19S0267", "19S0167"]), null);
  assert.equal(correctionCandidate("21S0471", ["20S0471"]), null);
  assert.equal(
    correctionCandidate("20Ы0227", ["20S0227", "20S0228"]),
    "20S0227",
  );
});
test("recovery preserves completed work and drafts; latest draft wins conflicts", () => {
  assert.deepEqual(
    mergeJavascriptWork(
      { completed: ["a"], assisted: ["b"], drafts: { a: "old", b: "retain" } },
      { completed: ["c", "a"], drafts: { a: "latest", c: "new" } },
    ),
    {
      completed: ["a", "c"],
      assisted: ["b"],
      drafts: { a: "latest", b: "retain", c: "new" },
    },
  );
});
