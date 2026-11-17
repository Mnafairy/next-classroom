"use client";

import { SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { useState } from "react";
import styles from "../curriculum.module.css";

const pageFile = "/app/shop/page.tsx";

export default function ShopJsxPreview({ code }: { code: string }) {
  const [draft, setDraft] = useState(code);
  const [run, setRun] = useState({ code, number: 0 });

  return (
    <div className={styles.runner}>
      <label>
        <code>app/shop/page.tsx</code>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={18}
          maxLength={20000}
          spellCheck={false}
          autoCapitalize="off"
        />
      </label>
      <div className={styles.runnerActions}>
        <button
          type="button"
          onClick={() => setRun({ code: draft, number: run.number + 1 })}
        >
          JSX ажиллуулах
        </button>
      </div>
      <p>HTML үр дүн</p>
      <SandpackProvider
        key={run.number}
        options={{ initMode: "lazy" }}
        template="react-ts"
        customSetup={{
          dependencies: { react: "19.2.8", "react-dom": "19.2.8" },
        }}
        files={{
          [pageFile]: run.code,
          "/App.tsx": {
            code: 'export { default } from "./app/shop/page";',
            hidden: true,
          },
          "/styles.css": {
            code: "body { margin: 16px; font: 16px/1.5 system-ui, sans-serif; } h1 { font-size: 22px; } h2 { font-size: 18px; } p { margin-block: 8px; }",
            hidden: true,
          },
        }}
        theme="dark"
      >
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          style={{ height: 245, background: "white" }}
        />
      </SandpackProvider>
    </div>
  );
}
