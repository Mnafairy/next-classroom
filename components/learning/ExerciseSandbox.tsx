"use client";

import {
  SandpackProvider,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  loadSandpackClient,
  type SandpackClient,
} from "@codesandbox/sandpack-client";
import {
  ArrowRight,
  Check,
  Code2,
  FileCode2,
  Folder,
  Play,
  SquareTerminal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BUTTON, CARD, PAGE } from "@/lib/course/lessons";
import { runnerCode, sandboxFiles } from "@/lib/course/sandbox";
import { validateRuntime } from "@/lib/course/runtime-checks";
import { createRunId } from "@/lib/course/run-id";
import type {
  CheckResult,
  Draft,
  Exercise,
  Files,
  RuntimeReport,
} from "@/lib/course/types";
import GuidedCodeEditor from "./GuidedCodeEditor";

type Props = {
  exercise: Exercise;
  draft: Draft;
  onDraft: (files: Files, answers?: Record<string, string>) => void;
  onChecked: (checks: CheckResult[]) => void;
  onMessage: (message: string) => void;
};
type Pending = {
  id: string;
  files: Files;
  resolve: (report: RuntimeReport) => void;
  reject: (error: Error) => void;
};

const sandboxSetup = {
  entry: "/index.tsx",
  dependencies: { react: "19.2.8", "react-dom": "19.2.8" },
};

function Workspace({ exercise, draft, onDraft, onChecked, onMessage }: Props) {
  const { sandpack } = useSandpack();
  const [mode, setMode] = useState<"guided" | "editor">(
    exercise.blanks && draft.answers.__mode !== "editor" ? "guided" : "editor",
  );
  const [resultTab, setResultTab] = useState<"result" | "expected">("result");
  const [mobileTab, setMobileTab] = useState<"code" | "result">("code");
  const [status, setStatus] = useState<"empty" | "running" | "ready" | "error">(
    "empty",
  );
  const [request, setRequest] = useState<{ id: string; code: string } | null>(
    null,
  );
  const [showTree, setShowTree] = useState(false);
  const [renderedSignature, setRenderedSignature] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);
  const client = useRef<SandpackClient | null>(null);
  const started = useRef("");
  const filePaths = Object.keys(exercise.starter);
  const currentFiles = useRef<Files>(draft.files);
  const lastSent = useRef(JSON.stringify(draft.files));

  useEffect(() => {
    const files = Object.fromEntries(
      Object.keys(exercise.starter).map((path) => [
        path,
        sandpack.files[path]?.code ?? "",
      ]),
    );
    currentFiles.current = files;
    const signature = JSON.stringify(files);
    if (signature !== lastSent.current) {
      lastSent.current = signature;
      onDraft(files);
    }
  }, [sandpack.files, exercise.starter, onDraft]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const iframe = frame.current?.querySelector("iframe");
      if (
        !iframe ||
        event.source !== iframe.contentWindow ||
        !event.data ||
        event.data.type !== "next-classroom-result" ||
        event.data.runId !== pending.current?.id
      )
        return;
      if (
        !Array.isArray(event.data.buttons) ||
        !Array.isArray(event.data.probes)
      )
        return;
      pending.current?.resolve(event.data as RuntimeReport);
    };
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
      pending.current?.reject(new Error("Exercise changed."));
      pending.current = null;
      client.current?.destroy();
      client.current = null;
    };
  }, []);

  useEffect(() => {
    if (!request || started.current === request.id) return;
    if (sandpack.files["/index.tsx"]?.code !== request.code) {
      sandpack.updateFile("/index.tsx", request.code, false);
      return;
    }
    started.current = request.id;
    const runId = request.id;
    // The React preview wrapper hashes IDs with crypto.subtle, unavailable on
    // classroom HTTP. The public runtime client supports the same iframe there.
    const runPreview = async () => {
      const iframe = frame.current?.querySelector("iframe");
      if (!iframe) throw new Error("The preview is not ready. Try Run again.");
      const setup = {
        files: sandpack.files,
        entry: "/index.tsx",
        dependencies: sandboxSetup.dependencies,
        template: "create-react-app-typescript" as const,
      };
      if (client.current) {
        client.current.updateSandbox(setup);
        return;
      }
      const runtimeClient = await loadSandpackClient(iframe, setup, {
        showOpenInCodeSandbox: false,
        showLoadingScreen: false,
        showErrorScreen: true,
      });
      if (pending.current?.id !== runId) {
        runtimeClient.destroy();
        return;
      }
      client.current = runtimeClient;
      runtimeClient.listen((message) => {
        if (message.type === "action" && message.action === "show-error")
          pending.current?.reject(new Error(message.message));
      });
    };
    runPreview().catch((error: unknown) => {
      if (pending.current?.id === runId)
        pending.current?.reject(
          new Error(
            error instanceof Error
              ? error.message
              : "The preview could not start.",
          ),
        );
    });
  }, [request, sandpack]);

  const execute = useCallback(
    async (checking: boolean) => {
      const files = Object.fromEntries(
        Object.keys(exercise.starter).map((path) => [
          path,
          sandpack.files[path]?.code ?? "",
        ]),
      );
      const signature = JSON.stringify(files);
      let id = "";
      let timeout: ReturnType<typeof setTimeout> | undefined;
      setStatus("running");
      setResultTab("result");
      onMessage("");
      onChecked([]);
      try {
        id = createRunId();
        let checks: CheckResult[] = [];
        if (checking) {
          const response = await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId: exercise.id, files, runId: id }),
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(
              data.error ?? "The checker is unavailable. Try again.",
            );
          checks = data.checks;
          if (checks.some((check) => !check.passed)) {
            if (JSON.stringify(currentFiles.current) === signature)
              onChecked(checks);
            setStatus("error");
            return;
          }
        }
        if (JSON.stringify(currentFiles.current) !== signature)
          throw new Error(
            "Your code changed during the check. Run the new version.",
          );
        const reportPromise = new Promise<RuntimeReport>((resolve, reject) => {
          pending.current = { id, files, resolve, reject };
          timeout = setTimeout(
            () =>
              reject(
                new Error(
                  "The preview did not respond. Check your internet connection and try Run again. Your code is still saved.",
                ),
              ),
            30000,
          );
        });
        setRequest({
          id,
          code: runnerCode(id, CARD in exercise.starter, exercise),
        });
        const report = await reportPromise;
        if (JSON.stringify(currentFiles.current) !== signature)
          throw new Error(
            "Your code changed during the run. Run the new version before checking it.",
          );
        if (report.error) throw new Error(report.error);
        setStatus("ready");
        setRenderedSignature(signature);
        if (checking)
          onChecked([...checks, ...validateRuntime(exercise, report, id)]);
      } catch (error) {
        if (pending.current?.id !== id && pending.current) return;
        setStatus("error");
        onMessage(
          error instanceof Error
            ? error.message
            : "The preview could not run. Try again.",
        );
      } finally {
        if (timeout) clearTimeout(timeout);
        if (pending.current?.id === id) pending.current = null;
      }
    },
    [sandpack.files, exercise, onChecked, onMessage],
  );

  const active = filePaths.includes(sandpack.activeFile)
    ? sandpack.activeFile
    : filePaths[0];
  const template = exercise.starter[active];
  const relevantBlanks =
    exercise.blanks?.filter((blank) => template.includes(blank.token)) ?? [];
  function fillBlank(token: string, value: string) {
    const answers = { ...draft.answers, [token]: value };
    const files = Object.fromEntries(
      Object.entries(exercise.starter).map(([path, code]) => [
        path,
        (exercise.blanks ?? []).reduce(
          (text, blank) =>
            text.replaceAll(blank.token, answers[blank.token] || blank.token),
          code,
        ),
      ]),
    );
    sandpack.updateFile(files, undefined, false);
    lastSent.current = JSON.stringify(files);
    onDraft(files, answers);
  }
  const dirty =
    !!renderedSignature &&
    renderedSignature !==
      JSON.stringify(
        Object.fromEntries(
          filePaths.map((path) => [path, sandpack.files[path]?.code ?? ""]),
        ),
      );
  return (
    <div
      className={`practice-workspace ${exercise.expectedCards && exercise.expectedCards.length > 1 ? "card-workspace" : ""}`}
    >
      <div className="run-actions">
        <div>
          <button
            className="button-secondary"
            onClick={() => execute(false)}
            disabled={status === "running"}
          >
            <Play size={14} />
            Run
          </button>
          <button
            className="button-primary"
            onClick={() => execute(true)}
            disabled={status === "running"}
          >
            <Check size={15} />
            {status === "running" ? "Working…" : "Check answer"}
          </button>
        </div>
      </div>
      <div
        className="mobile-workspace-tabs"
        role="tablist"
        aria-label="Practice panel"
      >
        <button
          role="tab"
          aria-selected={mobileTab === "code"}
          onClick={() => setMobileTab("code")}
        >
          Code
        </button>
        <button
          role="tab"
          aria-selected={mobileTab === "result"}
          onClick={() => setMobileTab("result")}
        >
          Result
        </button>
      </div>
      <div
        className={`editor-pane ${mobileTab === "code" ? "mobile-visible" : ""}`}
      >
        <div className="panel-heading">
          <div>
            <Code2 size={17} />
            <strong>Code</strong>
          </div>
          <button
            className="text-control"
            onClick={() => setShowTree(!showTree)}
            aria-expanded={showTree}
          >
            <Folder size={14} />
            Files
          </button>
        </div>
        {showTree && (
          <div className="file-tree">
            <div>
              <Folder size={13} />
              app
            </div>
            {filePaths.map((path) => (
              <button key={path} onClick={() => sandpack.setActiveFile(path)}>
                <span>{path === PAGE ? "└" : "└ components /"}</span>{" "}
                {path.split("/").at(-1)}
              </button>
            ))}
          </div>
        )}
        <div className="editor-tabs" role="tablist" aria-label="Exercise files">
          {filePaths.map((path) => (
            <button
              key={path}
              role="tab"
              aria-selected={active === path}
              onClick={() => sandpack.setActiveFile(path)}
            >
              <FileCode2 size={14} />
              {path.split("/").at(-1)}
              {active === path && <span className="tab-dot" />}
            </button>
          ))}
        </div>
        <div className="editor-filename">{active.slice(1)}</div>
        {mode === "guided" ? (
          <GuidedCodeEditor
            code={template}
            blanks={relevantBlanks}
            answers={draft.answers}
            onChange={fillBlank}
          />
        ) : (
          <SandpackCodeEditor
            showTabs={false}
            showRunButton={false}
            showLineNumbers
            showInlineErrors
            wrapContent={false}
            style={{ height: 310 }}
          />
        )}
        {mode === "guided" && (
          <div className="editor-bottom">
            <button
              onClick={() => {
                setMode("editor");
                onDraft(currentFiles.current, {
                  ...draft.answers,
                  __mode: "editor",
                });
              }}
            >
              Open full editor <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
      <div
        className={`result-pane ${mobileTab === "result" ? "mobile-visible" : ""}`}
      >
        <div className="panel-heading">
          <div>
            <SquareTerminal size={17} />
            <strong>Preview</strong>
          </div>
          <span className={`runtime-status status-${status}`}>
            {status === "running"
              ? "Running…"
              : status === "ready"
                ? "Ready"
                : status === "error"
                  ? "Needs attention"
                  : "Not run yet"}
          </span>
        </div>
        <div className="result-tabs" role="tablist" aria-label="Preview views">
          <button
            role="tab"
            aria-selected={resultTab === "result"}
            onClick={() => setResultTab("result")}
          >
            Your result
          </button>
          <button
            role="tab"
            aria-selected={resultTab === "expected"}
            onClick={() => setResultTab("expected")}
          >
            Expected result
          </button>
        </div>
        <div className="preview-display" ref={frame}>
          <div
            className={
              resultTab === "result"
                ? "sandbox-frame"
                : "sandbox-frame visually-hidden-preview"
            }
          >
            <iframe title="Your component preview" />
          </div>
          {resultTab === "expected" && (
            <div className="expected-buttons">
              {exercise.initialText && (
                <p
                  style={{
                    width: "100%",
                    margin: "0 0 8px",
                    textAlign: "center",
                  }}
                >
                  {exercise.initialText}
                </p>
              )}
              {exercise.expectedCards
                ? exercise.expectedCards.map((card, index) => (
                    <article
                      key={index}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: 12,
                        padding: 24,
                        width: 280,
                        textAlign: "left",
                        fontFamily: "system-ui, sans-serif",
                        color: "#172033",
                      }}
                    >
                      <h2 style={{ margin: "0 0 12px", fontSize: 22 }}>
                        {card.title}
                      </h2>
                      <p style={{ margin: "0 0 20px", lineHeight: 1.5 }}>
                        {card.description}
                      </p>
                      <button
                        tabIndex={-1}
                        style={{
                          backgroundColor: card.color,
                          color: "white",
                          padding: "12px 24px",
                          border: "none",
                          borderRadius: 8,
                        }}
                      >
                        {card.buttonLabel}
                      </button>
                    </article>
                  ))
                : exercise.expected?.map((button, index) => (
                    <button
                      key={index}
                      tabIndex={-1}
                      style={
                        button.color
                          ? {
                              backgroundColor: button.color,
                              color: "white",
                              padding: "12px 24px",
                              border: "none",
                              borderRadius: 8,
                            }
                          : undefined
                      }
                    >
                      {button.label}
                    </button>
                  ))}
            </div>
          )}
          {resultTab === "result" && status === "empty" && (
            <div className="preview-empty">
              <span>
                <Play size={23} />
              </span>
              <p>Run your code to see the result.</p>
            </div>
          )}
        </div>
        {dirty && resultTab === "result" && (
          <p className="preview-stale">Code changed. Run again to update.</p>
        )}
      </div>
    </div>
  );
}

export default function ExerciseSandbox(props: Props) {
  const [initialFiles] = useState(() =>
    sandboxFiles(props.draft.files, props.exercise),
  );
  return (
    <SandpackProvider
      template="react-ts"
      files={initialFiles}
      customSetup={sandboxSetup}
      theme={{
        colors: {
          surface1: "#242637",
          surface2: "#2c2e42",
          surface3: "#373950",
          clickable: "#b4b7d2",
          base: "#e5e7f6",
          disabled: "#72758e",
          hover: "#ffffff",
          accent: "#c1a1ff",
          error: "#ff8c99",
          errorSurface: "#362736",
        },
        syntax: {
          plain: "#e5e7f6",
          comment: { color: "#8589a5", fontStyle: "italic" },
          keyword: "#cf9fff",
          tag: "#ff8da9",
          punctuation: "#babed8",
          definition: "#94bcff",
          property: "#83d5ef",
          static: "#c8e6a5",
          string: "#c8e6a5",
        },
        font: {
          mono: '"Geist Mono", monospace',
          size: "13px",
          lineHeight: "1.85",
        },
      }}
      options={{
        autorun: false,
        autoReload: false,
        activeFile:
          props.exercise.activeFile ??
          (props.exercise.id === "import-component" ||
          props.exercise.id === "reuse-component" ||
          props.exercise.id === "pass-labels"
            ? PAGE
            : BUTTON),
        visibleFiles: Object.keys(props.exercise.starter),
        initMode: "immediate",
      }}
    >
      <Workspace {...props} />
    </SandpackProvider>
  );
}
