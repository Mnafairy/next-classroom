"use client";

import dynamic from "next/dynamic";
import {
  Check,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Download,
  LoaderCircle,
  Play,
  RotateCcw,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PythonRunner, type RunnerStatus } from "@/lib/python/runner";
import type { PythonExercise, RunResult } from "@/lib/python/types";

const PythonEditor = dynamic(() => import("./PythonEditor"), {
  ssr: false,
  loading: () => (
    <div className="py-editor-loading">
      <LoaderCircle className="py-spin" size={20} /> Кодын талбар бэлдэж байна…
    </div>
  ),
});

export function downloadFile(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CodeWorkspace({
  exercise,
  code,
  inputs,
  saving,
  solutionViewed,
  onChange,
  onInputs,
  onReset,
  onChecked,
}: {
  exercise?: PythonExercise;
  code: string;
  inputs: string;
  saving: boolean;
  solutionViewed: boolean;
  onChange: (value: string) => void;
  onInputs: (value: string) => void;
  onReset: () => void;
  onChecked: (code: string, result: RunResult) => void;
}) {
  const [runner] = useState(() => new PythonRunner());
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<"output" | "checks">("output");
  const sequence = useRef(0);
  const busy = status !== "idle";

  useEffect(
    () => () => {
      sequence.current++;
      runner.cancel();
    },
    [runner],
  );

  const execute = useCallback(
    async (check = false) => {
      if (busy) return;
      const current = ++sequence.current;
      setResult(null);
      setTab(check ? "checks" : "output");
      const response = await runner.run(
        code,
        inputs,
        check ? exercise : undefined,
        setStatus,
      );
      if (current !== sequence.current) return;
      setResult(response);
      if (check) onChecked(code, response);
    },
    [busy, runner, code, inputs, exercise, onChecked],
  );
  const run = useCallback(() => {
    void execute();
  }, [execute]);

  function invalidate() {
    sequence.current++;
    runner.cancel();
    setResult(null);
  }
  const passed =
    !!result?.checks.length && result.checks.every((check) => check.passed);

  return (
    <section className="py-code-workspace" aria-label="Код ба гаралт">
      <div className="py-editor-card">
        <div className="py-editor-header">
          <div>
            <span className="py-file-symbol">Py</span>
            <span className="py-filename">
              {exercise?.id ?? "playground"}.py
            </span>
          </div>
          <div>
            <span className="py-autosave">
              <span className={saving ? "" : "off"} />
              {saving ? "Автоматаар хадгална" : "Хадгалах боломжгүй"}
            </span>
            <button
              className="py-icon"
              title="Эхнээс нь эхлэх"
              aria-label="Кодыг эхнээс нь эхлэх"
              onClick={onReset}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="py-icon"
              title="Код татах"
              aria-label="Код татах"
              onClick={() =>
                downloadFile(`${exercise?.id ?? "playground"}.py`, code)
              }
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <PythonEditor
          code={code}
          onChange={(value) => {
            invalidate();
            onChange(value);
          }}
          onRun={run}
        />
        <details
          className="py-input-panel"
          open={!!exercise?.inputs || !exercise}
        >
          <summary>
            <span>
              <Terminal size={14} /> Оролт <code>input()</code>
            </span>
            <ChevronDown size={14} />
          </summary>
          <div>
            <label htmlFor="py-stdin">
              input() бүрийн утгыг тусдаа мөрөнд оруулна.
            </label>
            <textarea
              id="py-stdin"
              rows={Math.min(4, Math.max(2, inputs.split("\n").length))}
              value={inputs}
              placeholder={"Жишээ:\n12\n8"}
              onChange={(event) => {
                invalidate();
                onInputs(event.target.value);
              }}
              spellCheck={false}
            />
            <p>
              «Ажиллуулах» энэ оролтыг хэрэглэнэ.
              {exercise && " «Хариу шалгах» олон өгөгдлөөр шалгана."}
            </p>
          </div>
        </details>
        <div className="py-editor-footer">
          <span className="py-shortcut">
            <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
          </span>
          <div>
            {busy ? (
              <button className="py-secondary" onClick={() => runner.cancel()}>
                <Square size={14} /> Зогсоох
              </button>
            ) : (
              <button className="py-secondary" onClick={() => void execute()}>
                <Play size={16} /> Ажиллуулах
              </button>
            )}
            {exercise && (
              <button
                className="py-primary"
                disabled={busy}
                onClick={() => void execute(true)}
              >
                {busy ? (
                  <LoaderCircle className="py-spin" size={17} />
                ) : (
                  <CheckCheck size={17} />
                )}{" "}
                Хариу шалгах
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="py-console">
        <div className="py-console-tabs">
          <div role="tablist" aria-label="Кодын үр дүн">
            <button
              role="tab"
              id="py-output-tab"
              aria-controls="py-result-panel"
              aria-selected={tab === "output"}
              className={tab === "output" ? "active" : ""}
              onClick={() => setTab("output")}
            >
              <Terminal size={16} /> Консол
            </button>
            {exercise && (
              <button
                role="tab"
                id="py-checks-tab"
                aria-controls="py-result-panel"
                aria-selected={tab === "checks"}
                className={tab === "checks" ? "active" : ""}
                onClick={() => setTab("checks")}
              >
                <CheckCheck size={16} /> Шалгалт{" "}
                {result?.checks.length ? (
                  <span className={`py-count ${passed ? "passed" : ""}`}>
                    {result.checks.filter((check) => check.passed).length}/
                    {result.checks.length}
                  </span>
                ) : null}
              </button>
            )}
          </div>
          <button
            className="py-icon"
            aria-label="Гаралт цэвэрлэх"
            title="Гаралт цэвэрлэх"
            onClick={() => setResult(null)}
          >
            <Trash2 size={15} />
          </button>
        </div>
        <div
          className="py-console-body"
          role="tabpanel"
          id="py-result-panel"
          aria-labelledby={tab === "output" ? "py-output-tab" : "py-checks-tab"}
          aria-live="polite"
          aria-busy={busy}
        >
          {busy ? (
            <div className="py-empty-console">
              <LoaderCircle className="py-spin" size={25} />
              <strong>
                {status === "loading"
                  ? "Python бэлдэж байна…"
                  : "Код ажиллаж байна…"}
              </strong>
              <p>
                {status === "loading"
                  ? "Эхний удаа бага зэрэг хугацаа орно."
                  : "Удаан ажиллавал «Зогсоох» товчийг дараарай."}
              </p>
            </div>
          ) : result?.error ? (
            <div className="py-runtime-error">
              <CircleAlert size={18} />
              <div>
                <strong>Кодоо дахин шалгаарай</strong>
                <pre>{result.error}</pre>
              </div>
            </div>
          ) : tab === "output" ? (
            result && !result.checks.length ? (
              <>
                <div className="py-output-label">
                  <span /> Ажиллаж дууслаа
                </div>
                <pre className="py-output">
                  {result.output ||
                    "(Хэвлэсэн гаралт алга. print() ашигласан эсэхээ шалгаарай.)"}
                </pre>
              </>
            ) : (
              <div className="py-empty-console">
                <Terminal size={29} />
                <strong>Гаралт энд харагдана</strong>
                <p>print() бичээд «Ажиллуулах» товчийг дараарай.</p>
              </div>
            )
          ) : result?.checks.length ? (
            <>
              <div className={`py-check-summary ${passed ? "success" : ""}`}>
                {passed ? <Check size={19} /> : <CircleAlert size={19} />}
                <div>
                  <strong>
                    {passed
                      ? "Бүх шалгалт амжилттай!"
                      : "Дахин оролдоод үзээрэй."}
                  </strong>
                  <p>
                    {passed
                      ? solutionViewed
                        ? "Жишээ хариу үзсэн тул ахицад тооцохгүй. Эхнээс нь эхлүүлээд бие даан бодоорой."
                        : "Энэ дасгалыг бие даан гүйцэтгэлээ."
                      : "Доорх шалгалтын өгөгдөл болон хүлээгдэж буй гаралтыг харьцуулаарай."}
                  </p>
                </div>
              </div>
              <div className="py-check-list">
                {result.checks.map((check, index) => (
                  <details
                    key={`${check.label}-${index}`}
                    className={check.passed ? "passed" : "failed"}
                  >
                    <summary>
                      {check.passed ? (
                        <Check size={15} />
                      ) : (
                        <CircleAlert size={15} />
                      )}
                      <span>{check.label}</span>
                      <span>{check.passed ? "Зөв" : "Шалгах"}</span>
                    </summary>
                    {check.expected !== undefined && (
                      <div className="py-check-detail">
                        <div>
                          <span>Хүлээгдэж буй</span>
                          <pre>{check.expected || "(хоосон)"}</pre>
                        </div>
                        <div>
                          <span>Таны гаралт</span>
                          <pre>{check.error || check.actual || "(хоосон)"}</pre>
                        </div>
                      </div>
                    )}
                    {check.expected === undefined && (
                      <p className="py-requirement-detail">
                        {check.passed
                          ? "Шаардлага хангасан."
                          : "Даалгаварт заасан бүтцийг коддоо ашиглаарай. Тайлбар дотор бичсэн үгийг тооцохгүй."}
                      </p>
                    )}
                  </details>
                ))}
              </div>
            </>
          ) : (
            <div className="py-empty-console">
              <CheckCheck size={29} />
              <strong>Шийдлээ шалгаарай</strong>
              <p>«Хариу шалгах» нь кодыг өөр өөр утгаар ажиллуулна.</p>
            </div>
          )}
        </div>
      </div>
      <p className="py-runtime-note">
        <span /> Python 3 · Код таны браузерт ажиллана
      </p>
    </section>
  );
}
