import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";

test("add-student form keeps input on failure, blocks duplicate clicks and submits the chosen teacher class", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://example.test/admin",
    pretendToBeVisual: true,
  });
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const install = (key: string, value: unknown) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };
  for (const key of [
    "window",
    "self",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "MutationObserver",
  ])
    install(key, Reflect.get(dom.window, key));
  install("React", React);
  install("IS_REACT_ACT_ENVIRONMENT", true);
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  let release: (() => void) | undefined;
  let fail = true;
  let closes = 0;
  const requests: Record<string, unknown>[] = [];
  const saved: { id: string; name: string; groupId: string }[] = [];
  install("fetch", async (_url: unknown, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)));
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    return fail
      ? Response.json(
          { error: "Холболт тасарлаа. Дахин оролдоно уу." },
          { status: 503 },
        )
      : Response.json({ ok: true });
  });
  const { createRoot } = await import("react-dom/client");
  const { default: AddStudentDialog } =
    await import("../../components/admin/AddStudentDialog");
  const root = createRoot(document.getElementById("root")!);
  const input = (id: string) => document.getElementById(id) as HTMLInputElement;
  const fill = async (id: string, value: string) =>
    act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(input(id), value);
      input(id).dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
  const submit = () =>
    document
      .querySelector("form")!
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
  try {
    await act(async () =>
      root.render(
        React.createElement(AddStudentDialog, {
          groups: [{ id: "own-class", name: "7Г", grade: 7 }],
          defaultGroup: "own-class",
          onClose: () => {
            closes++;
          },
          onSaved: async (student) => {
            saved.push(student);
          },
        }),
      ),
    );
    assert.equal(
      (document.getElementById("new-student-group") as HTMLSelectElement).value,
      "own-class",
    );
    await fill("new-student-id", "20s0452");
    await fill("new-student-name", " М.Ананд ");
    await act(async () => {
      submit();
      submit();
    });
    assert.equal(requests.length, 1);
    assert.equal(input("new-student-id").disabled, true);
    await act(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Цонх хаах"]')!
        .click();
    });
    assert.equal(closes, 0);
    await act(async () => {
      release!();
    });
    assert.equal(input("new-student-id").value, "20s0452");
    assert.equal(input("new-student-name").value, " М.Ананд ");
    assert.match(
      document.querySelector('[role="alert"]')!.textContent!,
      /Холболт тасарлаа/,
    );
    fail = false;
    await act(async () => {
      submit();
    });
    await act(async () => {
      release!();
    });
    assert.deepEqual(saved, [
      { id: "20S0452", name: "М.Ананд", groupId: "own-class" },
    ]);
    assert.deepEqual(requests[0], {
      action: "create-student",
      studentId: "20S0452",
      name: "М.Ананд",
      groupId: "own-class",
    });
    assert.equal(requests.length, 2);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
