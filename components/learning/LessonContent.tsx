import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import type { Exercise } from "@/lib/course/types";

export default function LessonContent({ exercise }: { exercise: Exercise }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="lesson-copy" aria-label="Lesson explanation">
      <p className="lesson-summary">{exercise.concept.body}</p>
      {exercise.module === 0 && (
        <div className="resource-links">
          <a
            href="https://nodejs.org/en/download"
            target="_blank"
            rel="noreferrer"
          >
            Get Node.js <ArrowUpRight size={14} />
          </a>
          <a
            href="https://code.visualstudio.com/download"
            target="_blank"
            rel="noreferrer"
          >
            Get VS Code <ArrowUpRight size={14} />
          </a>
        </div>
      )}
      <div className="lesson-resources">
        <details className="lesson-explanation">
          <summary>Explanation</summary>
          <div className="explanation-body">
            {exercise.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </details>
        <details className="reference-example">
          <summary>Example</summary>
          <div className="reference-code">
            <div className="reference-toolbar">
              <span>{exercise.exampleFile}</span>
              <button
                aria-label={copied ? "Example copied" : "Copy example code"}
                className="copy-code"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(exercise.example);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>
              <code>{exercise.example}</code>
            </pre>
          </div>
        </details>
      </div>
    </section>
  );
}
