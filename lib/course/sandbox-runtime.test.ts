import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import ts from "typescript";
import { BUTTON, CARD, PAGE, exercises, findExercise } from "./lessons";
import { runnerCode, sandboxFiles } from "./sandbox";
import { validateRuntime } from "./runtime-checks";
import { validateSources } from "./validators";
import type { Exercise, Files, RuntimeReport } from "./types";

const nodeRequire = createRequire(import.meta.url);
async function withPreview(
  exercise: Exercise,
  files: Files,
  verify: (
    report: RuntimeReport,
    document: Document,
    click: (index: number) => void,
  ) => void,
) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    { url: "http://classroom.test" },
  );
  const window = dom.window;
  const globals = {
    window,
    IS_REACT_ACT_ENVIRONMENT: true,
    document: window.document,
    navigator: window.navigator,
    getComputedStyle: window.getComputedStyle.bind(window),
    alert: (message: string) => window.alert(message),
  };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(globals)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      value,
      writable: true,
      configurable: true,
    });
  }
  const reports: RuntimeReport[] = [];
  window.postMessage = (report: RuntimeReport) => {
    reports.push(report);
  };
  const style = window.document.createElement("style");
  style.textContent = sandboxFiles(files)["/preview.css"].code;
  window.document.head.appendChild(style);
  const modules: Files = {
    ...files,
    "/index.tsx": runnerCode("test-run", CARD in files, exercise),
  };
  const roots = new Set<Root>();
  const cache = new Map<string, { exports: unknown }>();
  function load(file: string): unknown {
    if (cache.has(file)) return cache.get(file)!.exports;
    const code = modules[file];
    assert.equal(typeof code, "string", `Missing exercise file: ${file}`);
    const virtualModule = { exports: {} };
    cache.set(file, virtualModule);
    const compiled = ts.transpileModule(code, {
      fileName: file,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText;
    const require = (specifier: string) => {
      if (specifier.endsWith(".css")) return {};
      if (specifier === "react-dom/client")
        return {
          createRoot: (...args: Parameters<typeof createRoot>) => {
            const root = createRoot(...args);
            roots.add(root);
            const unmount = root.unmount.bind(root);
            root.unmount = () => {
              roots.delete(root);
              unmount();
            };
            return root;
          },
        };
      if (!specifier.startsWith(".")) return nodeRequire(specifier);
      return load(
        path.posix.resolve(path.posix.dirname(file), specifier) + ".tsx",
      );
    };
    new Function("require", "exports", "module", compiled)(
      require,
      virtualModule.exports,
      virtualModule,
    );
    return virtualModule.exports;
  }
  try {
    await act(async () => {
      load("/index.tsx");
    });
    await act(async () => {
      assert.ok(reports.length, "The runner must deliver a result");
      assert.ok(
        !reports.some((report) => report.error),
        JSON.stringify(reports),
      );
      const report = reports.at(-1)!;
      verify(report, window.document, (index) => {
        flushSync(() =>
          window.document
            .querySelectorAll<HTMLButtonElement>("#root button")
            [index]?.click(),
        );
      });
    });
  } finally {
    await act(async () => {
      for (const root of roots) root.unmount();
    });
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
}

for (const exercise of exercises.filter(
  (exercise) => exercise.kind === "code",
)) {
  test(`real React render and runtime checks: ${exercise.id}`, async () => {
    await withPreview(exercise, exercise.solution, (report, document) => {
      const checks = validateRuntime(exercise, report, "test-run");
      assert.ok(
        checks.every((check) => check.passed),
        JSON.stringify(checks),
      );
      assert.deepEqual(
        Array.from(
          document.querySelectorAll("#root button"),
          (button) => button.textContent,
        ),
        exercise.expected!.map((button) => button.label),
        "Checker clicks must leave the student's visible preview at its initial state",
      );
    });
  });
}

const events = findExercise("event-props")!;
const counter = findExercise("state-counter")!;
const likes = findExercise("like-cards")!;
const fails = (exercise: Exercise, files: Files) =>
  withPreview(exercise, files, (report) => {
    assert.ok(
      validateRuntime(exercise, report, "test-run").some(
        (check) => !check.passed,
      ),
    );
  });

test("a disconnected Button handler fails even with correct card text", async () => {
  await fails(events, {
    ...events.solution,
    [BUTTON]: events.solution[BUTTON].replace(
      "onClick={onClick}",
      "onClick={() => {}}",
    ),
  });
});
test("a handler called twice per click fails", async () => {
  await fails(events, {
    ...events.solution,
    [BUTTON]: events.solution[BUTTON].replace(
      "onClick={onClick}",
      "onClick={() => { onClick(); onClick(); }}",
    ),
  });
});
test("calling a handler during rendering is rejected", async () => {
  await fails(events, {
    ...events.solution,
    [PAGE]: events.solution[PAGE].replace(
      'onClick={() => handleOpen("React basics")}',
      'onClick={handleOpen("React basics")}',
    ),
  });
});
test("hard-coded second card action fails", async () => {
  const exercise = findExercise("card-actions")!;
  await fails(exercise, exercise.starter);
});
test("setting count to one instead of incrementing fails repeated clicks", async () => {
  await fails(counter, {
    ...counter.solution,
    [PAGE]: counter.solution[PAGE].replace(
      "setCount(count + 1)",
      "setCount(1)",
    ),
  });
});
test("resetting to the wrong value fails", async () => {
  const exercise = findExercise("reset-counter")!;
  await fails(exercise, {
    ...exercise.solution,
    [PAGE]: exercise.solution[PAGE].replace("setCount(0)", "setCount(1)"),
  });
});
test("state stored outside Card cannot update the Like counts correctly", async () => {
  await fails(likes, {
    ...likes.solution,
    [CARD]: likes.solution[CARD].replace(
      'import Button from "./Button";',
      'import Button from "./Button";\nlet sharedLikes = 0;',
    ).replace("setLikes(likes + 1)", "sharedLikes += 1; setLikes(sharedLikes)"),
  });
});
test("the live preview remains interactive after hidden checker clicks", async () => {
  await withPreview(likes, likes.solution, (_report, document, click) => {
    click(0);
    click(0);
    click(1);
    assert.deepEqual(
      Array.from(
        document.querySelectorAll("#root button"),
        (button) => button.textContent,
      ),
      ["Likes: 2", "Likes: 1"],
    );
  });
  await withPreview(
    findExercise("handle-click")!,
    findExercise("handle-click")!.solution,
    (_report, document, click) => {
      assert.equal(document.querySelector("#preview-alert"), null);
      click(0);
      assert.equal(
        document.querySelector('[role="status"]')?.textContent,
        "Button clicked!",
      );
    },
  );
});
test("Next.js client directives and React state imports are required", async () => {
  assert.equal(
    validateSources(counter, {
      ...counter.solution,
      [PAGE]: counter.solution[PAGE].replace('"use client";', ""),
    }).find((check) => check.label.includes('"use client"'))?.passed,
    false,
  );
  const noState = counter.solution[PAGE].replace(
    'import { useState } from "react";',
    "",
  ).replace(
    "const [count, setCount] = useState(0);",
    "const count = 0; const setCount = () => {};",
  );
  assert.equal(
    validateSources(counter, { ...counter.solution, [PAGE]: noState }).find(
      (check) => check.label === "Import and use React's useState",
    )?.passed,
    false,
  );
});
