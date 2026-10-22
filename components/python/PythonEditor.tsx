"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView, keymap } from "@codemirror/view";
import { useMemo } from "react";

export default function PythonEditor({
  code,
  onChange,
  onRun,
}: {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
}) {
  const extensions = useMemo(
    () => [
      python(),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": "Python код бичих талбар",
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
        "&": { fontSize: "14px", backgroundColor: "#ffffff", color: "#263650" },
        ".cm-content": {
          padding: "22px 0",
          fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
          minHeight: "320px",
        },
        ".cm-line": { padding: "0 22px" },
        ".cm-gutters": {
          backgroundColor: "#fbfcff",
          color: "#96a3b9",
          borderRight: "1px solid #eef1f7",
          padding: "0 5px 0 12px",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#edf3ff",
          color: "#2458e6",
        },
        ".cm-activeLine": { backgroundColor: "#f5f8ff" },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": { lineHeight: "1.9" },
        ".cm-cursor": { borderLeftColor: "#2458e6" },
      }),
    ],
    [onRun],
  );

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      extensions={extensions}
      height="340px"
      basicSetup={{
        tabSize: 4,
        foldGutter: false,
        highlightActiveLine: true,
        autocompletion: true,
      }}
      indentWithTab
    />
  );
}
