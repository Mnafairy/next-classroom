import { Fragment } from "react";
import type { Blank } from "@/lib/course/types";

export default function GuidedCodeEditor({
  code,
  blanks,
  answers,
  onChange,
}: {
  code: string;
  blanks: Blank[];
  answers: Record<string, string>;
  onChange: (token: string, value: string) => void;
}) {
  const tokens = new Map(blanks.map((blank) => [blank.token, blank]));
  return (
    <div className="guided-code" aria-label="Fill in the code gaps">
      {code.split("\n").map((line, index) => (
        <div className="code-line" key={index}>
          <span className="line-number" aria-hidden="true">
            {index + 1}
          </span>
          <code>
            {line.split(/(__[A-Z]+__)/g).map((part, partIndex) => {
              const blank = tokens.get(part);
              return blank ? (
                <input
                  key={partIndex}
                  aria-label={blank.label}
                  spellCheck={false}
                  autoComplete="off"
                  value={answers[part] ?? ""}
                  placeholder="…"
                  style={{ width: `${blank.width ?? 10}ch` }}
                  onChange={(event) => onChange(part, event.target.value)}
                />
              ) : (
                <Fragment key={partIndex}>{part}</Fragment>
              );
            })}
          </code>
        </div>
      ))}
    </div>
  );
}
