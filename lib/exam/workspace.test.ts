import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { examQuestions, examExercises } from "./content";
import type { ActiveExam, ExamView } from "./types";

test("exam page preserves edits through a delayed save, failed submit, retry, and next-student handoff", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://example.test/exam",
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
    "localStorage",
    "requestAnimationFrame",
    "cancelAnimationFrame",
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
  type Stored = Omit<ActiveExam, "status"> & { status: ExamView["status"] };
  const fresh = (id: string): Stored => ({
    studentId: id,
    name: id,
    className: "8А",
    status: "active",
    generation: 0,
    deadline: new Date(Date.now() + 35 * 60000).toISOString(),
    revision: 0,
    departures: 0,
    answers: {
      choices: {},
      code: Object.fromEntries(examExercises.map((e) => [e.id, e.starter])),
    },
    questions: examQuestions,
    exercises: examExercises,
  });
  let server: Stored | null = fresh("TESTA");
  let failSubmit = true;
  let expireSubmit = false;
  let releaseSave: (() => void) | undefined;
  let releaseSubmit: (() => void) | undefined;
  let savedFirst: Stored | null = null;
  const calls: Record<string, unknown>[] = [];
  const response = () =>
    Response.json({
      attempt:
        server && server.status !== "active"
          ? {
              studentId: server.studentId,
              name: server.name,
              className: server.className,
              generation: server.generation,
              status: server.status,
            }
          : structuredClone(server),
      serverNow: Date.now(),
    });
  install("fetch", async (_url: unknown, init?: RequestInit) => {
    if (!init?.body) return response();
    const body = JSON.parse(String(init.body));
    calls.push(body);
    if (body.action === "departure") return Response.json({ ok: true });
    if (body.action === "start") {
      server = fresh(body.studentId);
      return response();
    }
    assert.equal(body.studentId, server?.studentId);
    assert.equal(body.generation, server?.generation);
    if (body.action === "next-student") {
      assert.equal(server?.status, "submitted");
      savedFirst = structuredClone(server);
      server = null;
      return response();
    }
    if (body.action === "submit") {
      await new Promise<void>((resolve) => {
        releaseSubmit = resolve;
      });
      if (expireSubmit) {
        assert(server);
        server = { ...server, status: "expired" };
        return Response.json(
          {
            code: "exam_recovery_saved",
            error: "Хугацаа дууссан. Ажлыг нөөцөд хадгалсан.",
          },
          { status: 409 },
        );
      }
      if (failSubmit) {
        failSubmit = false;
        throw new TypeError("offline");
      }
    } else if (body.action === "save" && server?.revision === 0) {
      await new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
    }
    assert(server);
    server = {
      ...server,
      revision: server.revision + 1,
      answers: { choices: body.choices, code: body.code },
      status: body.action === "submit" ? "submitted" : "active",
    };
    return response();
  });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root")!);
  const click = async (element: Element) => {
    await act(async () => {
      element.dispatchEvent(
        new dom.window.MouseEvent("click", { bubbles: true }),
      );
    });
  };
  const button = (label: string) => {
    const found = [...document.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === label,
    );
    assert(found, label);
    return found;
  };
  const question = (n: number) => {
    const found = [...document.querySelectorAll("button")].find(
      (b) =>
        b.getAttribute("aria-label")?.startsWith(`Тест ${n},`) ||
        b.getAttribute("aria-label") === `Тест ${n}`,
    );
    assert(found);
    return found;
  };
  const option = (n: number) =>
    document.querySelectorAll<HTMLInputElement>('input[type="radio"]')[n];
  try {
    const { default: ExamWorkspace } =
      await import("../../components/exam/ExamWorkspace");
    await act(async () => {
      root.render(React.createElement(ExamWorkspace));
    });
    await click(option(1));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1250));
    });
    assert(releaseSave, "Autosave started");
    await click(question(20));
    await click(option(3));
    await act(async () => {
      releaseSave!();
    });
    assert.equal(
      option(3).checked,
      true,
      "Late save acknowledgment cannot erase newer edits",
    );
    await click(button("Шалгалт дуусгаж илгээх"));
    await click(button("Илгээх"));
    assert(releaseSubmit);
    assert.equal(button("Үргэлжлүүлэх").disabled, true);
    assert.equal(
      option(3).matches(":disabled"),
      true,
      "Answers are locked while submitting",
    );
    const escape = new dom.window.Event("cancel", { cancelable: true });
    document.querySelector("dialog")!.dispatchEvent(escape);
    assert(
      escape.defaultPrevented,
      "Escape cannot reopen editing while submit is in flight",
    );
    await act(async () => {
      releaseSubmit!();
    });
    assert.equal(
      option(3).checked,
      true,
      "Failed submit retains the final answer",
    );
    assert(
      document.querySelector("dialog")!.open,
      "Failed submit keeps retry available",
    );
    assert(document.querySelector('[role="alert"]')?.textContent);
    await click(button("Илгээх"));
    await act(async () => {
      releaseSubmit!();
    });
    assert.equal(server?.status, "submitted");
    assert.deepEqual(server?.answers.choices, { q01: 1, q20: 3 });
    assert.match(document.body.textContent || "", /Шалгалтаа илгээлээ/);
    await click(button("Дараагийн сурагч"));
    const input = document.getElementById("exam-student") as HTMLInputElement;
    assert.equal(input.value, "");
    assert(!document.body.textContent?.includes("TESTA"));
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "TESTB");
      input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
    await act(async () => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new dom.window.Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    assert.equal(server?.studentId, "TESTB");
    assert.deepEqual(server?.answers.choices, {});
    assert.match(document.body.textContent || "", /0 \/ 26/);
    assert.equal(option(1).checked, false);
    assert.deepEqual((savedFirst as Stored | null)?.answers.choices, {
      q01: 1,
      q20: 3,
    });
    assert.equal(calls.filter((c) => c.action === "submit").length, 2);
    await click(option(2));
    expireSubmit = true;
    await click(button("Шалгалт дуусгаж илгээх"));
    await click(button("Илгээх"));
    await act(async () => {
      releaseSubmit!();
    });
    assert.match(document.body.textContent || "", /Шалгалтын хугацаа дууссан/);
    assert.equal(document.querySelector("dialog")!.open, false);
    assert(button("Дараагийн сурагч"));
    assert(
      [...Array(localStorage.length)].some((_, i) =>
        localStorage.key(i)?.includes(":TESTB:0"),
      ),
      "Expired attempt keeps its local draft",
    );
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
