"use client";

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { EditorView, keymap } from "@codemirror/view";
import { useMemo } from "react";
import type { Files } from "@/lib/web-lab/lessons";

export default function WebEditor({
  file,
  code,
  onChange,
  onRun,
}: {
  file: keyof Files;
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
}) {
  const extensions = useMemo(
    () => [
      file === "index.html" ? html() : css(),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": `${file} код бичих талбар`,
        spellcheck: "false",
      }),
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onRun();
            return true;
          },
        },
      ]),
      EditorView.theme({
        "&": { fontSize: "14px", backgroundColor: "#fff", color: "#263650" },
        ".cm-content": {
          padding: "16px 0",
          fontFamily: "var(--font-geist-mono), monospace",
          minHeight: "300px",
        },
        ".cm-line": { padding: "0 16px" },
        ".cm-gutters": {
          backgroundColor: "#fafbff",
          color: "#94a3bc",
          borderRight: "1px solid #edf1f8",
          paddingLeft: "8px",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#eef3ff",
          color: "#315efb",
        },
        ".cm-activeLine": { backgroundColor: "#f6f8fe" },
        ".cm-scroller": { lineHeight: "1.8" },
        "&.cm-focused": { outline: "2px solid #aebfff", outlineOffset: "-2px" },
      }),
    ],
    [file, onRun],
  );

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      height="320px"
      extensions={extensions}
      basicSetup={{ tabSize: 2, foldGutter: false, autocompletion: true }}
      indentWithTab
    />
  );
}
