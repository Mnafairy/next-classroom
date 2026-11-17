import assert from "node:assert/strict";
import test from "node:test";
import { timeoutSignal } from "./timeout";

test("a browser without AbortSignal.timeout still receives an abortable signal", async () => {
  const nativeTimeout = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
  Object.defineProperty(AbortSignal, "timeout", {
    configurable: true,
    value: undefined,
  });
  try {
    const signal = timeoutSignal(5);
    assert.equal(signal.aborted, false);
    await new Promise<void>((resolve) =>
      signal.addEventListener("abort", () => resolve(), { once: true }),
    );
    assert.equal(signal.aborted, true);
  } finally {
    if (nativeTimeout)
      Object.defineProperty(AbortSignal, "timeout", nativeTimeout);
    else Reflect.deleteProperty(AbortSignal, "timeout");
  }
});
