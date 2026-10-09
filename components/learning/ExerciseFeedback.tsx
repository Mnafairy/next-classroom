import { Check, CircleAlert, Lightbulb } from "lucide-react";
import type { CheckResult } from "@/lib/course/types";

export default function ExerciseFeedback({
  checks,
  message,
  hint,
  viewedSolution,
}: {
  checks: CheckResult[];
  message?: string;
  hint?: string;
  viewedSolution?: boolean;
}) {
  const passed = checks.length > 0 && checks.every((check) => check.passed);
  const failures = checks.filter((check) => !check.passed);
  return (
    <div className="exercise-feedback" aria-live="polite">
      {hint && (
        <div className="hint-box">
          <Lightbulb size={17} />
          <p>{hint}</p>
        </div>
      )}
      {message && (
        <p className="feedback-message">
          <CircleAlert size={16} />
          {message}
        </p>
      )}
      {checks.length > 0 && (
        <div className={`check-results ${passed ? "all-passed" : ""}`}>
          <strong className="check-summary">
            {passed ? <Check size={18} /> : <CircleAlert size={18} />}
            {passed
              ? viewedSolution
                ? "Solution checked. Reset to try it yourself."
                : "Exercise complete"
              : "A few things to fix"}
          </strong>
          {failures.map((check, index) => (
            <div className="check-row" key={index}>
              <div>
                <span>{check.label}</span>
                {check.detail && <p>{check.detail}</p>}
              </div>
            </div>
          ))}
          <details className="check-details">
            <summary>View {checks.length} checks</summary>
            {checks.map((check, index) => (
              <div className="check-row" key={index}>
                {check.passed ? (
                  <Check size={15} className="passed" />
                ) : (
                  <CircleAlert size={15} />
                )}
                <span>{check.label}</span>
              </div>
            ))}
          </details>
        </div>
      )}
    </div>
  );
}
