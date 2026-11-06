"use client";

import { useEffect, useRef, useState } from "react";
import { cancelRuns, execute } from "@/apps/kodlab/src/runtime";
import { PythonRunner } from "@/lib/python/runner";
import type { ExampleFile } from "@/lib/curriculum/types";
import { useSessionDraft } from "@/lib/curriculum/practice/use-session-draft";
import styles from "../curriculum.module.css";

type RunnableFile = Extract<ExampleFile, { mode: "javascript" | "python" }>;

type CodeDraft = { code: string; inputs: string };
function restoreCode(raw: unknown): CodeDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<CodeDraft>;
  return typeof value.code === "string" &&
    value.code.length <= 40000 &&
    typeof value.inputs === "string" &&
    value.inputs.length <= 10000
    ? { code: value.code, inputs: value.inputs }
    : null;
}

export default function PracticeRunner({
  file,
  draftKey,
}: {
  file: RunnableFile;
  draftKey?: string;
}) {
  const [{ code, inputs }, setDraft, warning] = useSessionDraft(
    draftKey ?? null,
    {
      code: file.contents,
      inputs: file.mode === "python" ? (file.inputs ?? "") : "",
    },
    restoreCode,
  );
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const runner = useRef<PythonRunner | null>(null);
  const runId = useRef(0);

  useEffect(
    () => () => {
      runId.current += 1;
      if (file.mode === "python") runner.current?.cancel();
      else cancelRuns();
    },
    [file.mode],
  );

  function stop() {
    runId.current += 1;
    if (file.mode === "python") runner.current?.cancel();
    else cancelRuns();
    setOutput("Ажиллуулалтыг зогсоолоо.");
    setRunning(false);
  }

  async function run() {
    const id = ++runId.current;
    setRunning(true);
    setOutput(
      file.mode === "python" ? "Python ачаалж байна…" : "Ажиллуулж байна…",
    );

    try {
      let output: string;
      if (file.mode === "python") {
        runner.current ??= new PythonRunner();
        const result = await runner.current.run(
          code,
          inputs,
          undefined,
          () => {},
        );
        output = [result.output, result.error].filter(Boolean).join("\n");
      } else {
        const result = await execute(code);
        output = [...result.logs.map((log) => log.text), result.error]
          .filter(Boolean)
          .join("\n");
      }
      if (runId.current === id) setOutput(output || "Гаралт хоосон байна.");
    } catch {
      if (runId.current === id)
        setOutput("Код ажиллуулахад алдаа гарлаа. Дахин туршаарай.");
    } finally {
      if (runId.current === id) setRunning(false);
    }
  }

  return (
    <div className={styles.runner}>
      <label>
        {file.name}
        <textarea
          aria-label={`${file.name} код`}
          value={code}
          onChange={(event) => {
            setDraft({ code: event.target.value, inputs });
            setOutput("");
          }}
          rows={Math.min(18, Math.max(5, file.contents.split("\n").length + 1))}
          spellCheck={false}
          maxLength={40000}
          autoCapitalize="off"
          disabled={running}
        />
      </label>
      {file.mode === "python" && (
        <label>
          Оролт · мөр бүрд нэг утга
          <textarea
            className={styles.inputs}
            value={inputs}
            onChange={(event) => {
              setDraft({ code, inputs: event.target.value });
              setOutput("");
            }}
            rows={Math.min(6, Math.max(2, inputs.split("\n").length))}
            spellCheck={false}
            maxLength={10000}
            disabled={running}
          />
        </label>
      )}
      <div className={styles.runnerActions}>
        {running ? (
          <button type="button" onClick={stop}>
            Зогсоох
          </button>
        ) : (
          <button type="button" onClick={run}>
            Ажиллуулах
          </button>
        )}
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(code.toWellFormed())}`}
          download={file.name}
        >
          Код татах
        </a>
      </div>
      <pre className={styles.output} role="status" tabIndex={0}>
        {output || "Гаралт энд харагдана."}
      </pre>
      {warning && <p role="alert">{warning}</p>}
    </div>
  );
}
