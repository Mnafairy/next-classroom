"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Lightbulb,
  Menu,
  MoreHorizontal,
  RotateCcw,
  Terminal,
  Trophy,
  X,
} from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { exercises, modules, COMMANDS } from "@/lib/course/lessons";
import {
  canSave,
  getDraft,
  getProgress,
  getServerProgress,
  subscribeProgress,
  updateProgress,
} from "@/lib/course/progress";
import type { CheckResult, Files } from "@/lib/course/types";
import ExerciseFeedback from "./ExerciseFeedback";
import GuidedCodeEditor from "./GuidedCodeEditor";
import LessonContent from "./LessonContent";
import LessonNavigation from "./LessonNavigation";

const ExerciseSandbox = dynamic(() => import("./ExerciseSandbox"), {
  ssr: false,
  loading: () => (
    <div className="sandbox-loading">
      <Code2 size={24} />
      <span>Getting your editor ready…</span>
    </div>
  ),
});

export default function LearningWorkspace() {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgress,
    getServerProgress,
  );
  const exercise =
    exercises.find((item) => item.id === progress.active) ?? exercises[0];
  const index = exercises.indexOf(exercise);
  const draft = getDraft(progress, exercise);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [message, setMessage] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sandboxKey, setSandboxKey] = useState(0);
  const [reset, setReset] = useState<"exercise" | "course" | null>(null);
  const [solutionConfirm, setSolutionConfirm] = useState(false);
  const completed = progress.completed.includes(exercise.id);
  const lessonHeading = useRef<HTMLHeadingElement>(null);

  function select(id: string) {
    updateProgress((current) => ({ ...current, active: id }));
    setChecks([]);
    setMessage("");
    setHintIndex(-1);
    setSidebarOpen(false);
    setSolutionConfirm(false);
    lessonHeading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function saveDraft(files: Files, answers?: Record<string, string>) {
    updateProgress((current) => {
      const previous = getDraft(current, exercise);
      return {
        ...current,
        completed: current.completed.filter((id) => id !== exercise.id),
        drafts: {
          ...current.drafts,
          [exercise.id]: {
            ...previous,
            files,
            answers: answers ?? previous.answers,
          },
        },
      };
    });
    setChecks([]);
    setMessage("");
  }

  function checked(results: CheckResult[]) {
    setChecks(results);
    if (
      results.length &&
      results.every((check) => check.passed) &&
      !getDraft(getProgress(), exercise).viewedSolution
    )
      updateProgress((current) => ({
        ...current,
        completed: [...new Set([...current.completed, exercise.id])],
      }));
  }

  function answer(id: string, value: string) {
    saveDraft(draft.files, { ...draft.answers, [id]: value });
  }
  function checkKnowledge() {
    if (exercise.kind === "quiz")
      checked(
        (exercise.questions ?? []).map((question) => ({
          label: question.prompt,
          passed: draft.answers[question.id] === question.answer,
          detail: question.explanation,
        })),
      );
    else
      checked(
        (exercise.blanks ?? []).map((blank) => ({
          label: blank.label,
          passed: (draft.answers[blank.token] ?? "").trim() === blank.answer,
          detail: `Use ${blank.answer} here.`,
        })),
      );
  }
  function showSolution() {
    const answers = { ...draft.answers };
    exercise.blanks?.forEach((blank) => {
      answers[blank.token] = blank.answer;
    });
    exercise.questions?.forEach((question) => {
      answers[question.id] = question.answer;
    });
    updateProgress((current) => ({
      ...current,
      completed: current.completed.filter((id) => id !== exercise.id),
      drafts: {
        ...current.drafts,
        [exercise.id]: {
          files: { ...exercise.solution },
          answers,
          viewedSolution: true,
        },
      },
    }));
    setSandboxKey((key) => key + 1);
    setChecks([]);
    setMessage(
      "Solution loaded. Read through it, then reset the exercise to practice on your own.",
    );
    setSolutionConfirm(false);
  }
  function performReset() {
    updateProgress((current) =>
      reset === "course"
        ? { version: 1, active: exercises[0].id, completed: [], drafts: {} }
        : {
            ...current,
            completed: current.completed.filter((id) => id !== exercise.id),
            drafts: {
              ...current.drafts,
              [exercise.id]: {
                files: { ...exercise.starter },
                answers: {},
                viewedSolution: false,
              },
            },
          },
    );
    setSandboxKey((key) => key + 1);
    setChecks([]);
    setMessage("");
    setHintIndex(-1);
    setReset(null);
  }

  return (
    <div className="learning-app">
      <header className="app-header">
        <div className="brand-area">
          <button
            className="icon-button mobile-menu"
            aria-label="Open course navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <Link className="brand" href="/" aria-label="Next Classroom home">
            <span className="brand-symbol">
              N<span>↗</span>
            </span>
            <span>
              next<span className="brand-divider">/</span>
              <strong>classroom</strong>
            </span>
          </Link>
        </div>
        <div className="header-meta">
          <span className="local-save">
            <span className={canSave() ? "save-dot" : "save-dot storage-off"} />
            {canSave()
              ? "Saved on this device"
              : "Practice mode · saving unavailable"}
          </span>
          <details className="course-options">
            <summary aria-label="Course options">
              <MoreHorizontal size={20} />
            </summary>
            <div className="options-menu">
              <button onClick={() => setReset("course")}>
                <RotateCcw size={14} />
                Reset all progress
              </button>
            </div>
          </details>
        </div>
      </header>
      <div className="app-body">
        <LessonNavigation
          active={exercise.id}
          completed={progress.completed}
          onSelect={select}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <button
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}
        <main className="course-main" id="main-content">
          <div className="course-topline">
            <span className="lesson-context">
              {modules[exercise.module].title}
            </span>
            <span className="lesson-position">
              Lesson {index + 1} of {exercises.length}
              <span aria-hidden="true"> · </span>
              {exercise.duration}
            </span>
          </div>
          <div className="lesson-title-row">
            <h1 ref={lessonHeading} tabIndex={-1}>
              {exercise.title}
            </h1>
            {completed && (
              <span className="lesson-status lesson-complete">
                <CheckCircle2 size={14} />
                Complete
              </span>
            )}
          </div>
          <LessonContent key={exercise.id} exercise={exercise} />
          <section className="practice-section" aria-label="Practice exercise">
            <div className="task-heading">
              <h2>
                {exercise.kind === "quiz"
                  ? "Check your understanding"
                  : "Your task"}
              </h2>
              <p>{exercise.task}</p>
            </div>
            {exercise.kind === "code" ? (
              <ExerciseSandbox
                key={`${exercise.id}-${sandboxKey}`}
                exercise={exercise}
                draft={draft}
                onDraft={saveDraft}
                onChecked={checked}
                onMessage={setMessage}
              />
            ) : (
              <div className="knowledge-workspace">
                <div
                  className={
                    exercise.kind === "commands"
                      ? "command-editor"
                      : "quiz-panel"
                  }
                >
                  {exercise.kind === "commands" ? (
                    <>
                      <div className="panel-heading">
                        <div>
                          <Terminal size={17} />
                          <strong>Your terminal commands</strong>
                        </div>
                      </div>
                      <GuidedCodeEditor
                        code={exercise.starter[COMMANDS]}
                        blanks={exercise.blanks ?? []}
                        answers={draft.answers}
                        onChange={(token, value) => {
                          const answers = { ...draft.answers, [token]: value };
                          const code = (exercise.blanks ?? []).reduce(
                            (text, blank) =>
                              text.replaceAll(
                                blank.token,
                                answers[blank.token] || blank.token,
                              ),
                            exercise.starter[COMMANDS],
                          );
                          saveDraft({ [COMMANDS]: code }, answers);
                        }}
                      />
                    </>
                  ) : (
                    exercise.questions?.map((question, questionIndex) => (
                      <fieldset className="quiz-question" key={question.id}>
                        <legend>
                          <span>
                            {String(questionIndex + 1).padStart(2, "0")}
                          </span>
                          {question.prompt}
                        </legend>
                        <div className="quiz-choices">
                          {question.choices.map((choice) => (
                            <label
                              className={
                                draft.answers[question.id] === choice
                                  ? "choice-selected"
                                  : ""
                              }
                              key={choice}
                            >
                              <input
                                type="radio"
                                name={`${exercise.id}-${question.id}`}
                                value={choice}
                                checked={draft.answers[question.id] === choice}
                                onChange={() => answer(question.id, choice)}
                              />
                              <span>{choice}</span>
                              {draft.answers[question.id] === choice && (
                                <Check size={13} />
                              )}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))
                  )}
                </div>
                <div className="run-actions">
                  <button className="button-primary" onClick={checkKnowledge}>
                    <Check size={15} />
                    Check answer
                  </button>
                </div>
              </div>
            )}
            <ExerciseFeedback
              checks={checks}
              message={message}
              hint={
                hintIndex >= 0
                  ? exercise.hints[
                      Math.min(hintIndex, exercise.hints.length - 1)
                    ]
                  : undefined
              }
              viewedSolution={draft.viewedSolution}
            />
            <div className="practice-help">
              <div>
                <button
                  onClick={() =>
                    setHintIndex((value) =>
                      Math.min(value + 1, exercise.hints.length - 1),
                    )
                  }
                >
                  <Lightbulb size={15} />
                  {hintIndex < 0
                    ? "Hint"
                    : hintIndex < exercise.hints.length - 1
                      ? "Another hint"
                      : "Hint shown"}
                </button>
              </div>
              <details className="exercise-options">
                <summary>Exercise options</summary>
                <div className="options-menu">
                  <button onClick={() => setReset("exercise")}>
                    <RotateCcw size={14} />
                    Reset exercise
                  </button>
                  <button onClick={() => setSolutionConfirm(true)}>
                    <Lightbulb size={14} />
                    Show solution
                  </button>
                </div>
              </details>
            </div>
          </section>
          {exercise.checklist && (
            <details className="setup-checklist">
              <summary>Setup checklist</summary>
              {exercise.checklist.map((item, itemIndex) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={draft.answers[`checklist-${itemIndex}`] === "done"}
                    onChange={(event) =>
                      answer(
                        `checklist-${itemIndex}`,
                        event.target.checked ? "done" : "",
                      )
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}
            </details>
          )}
          {progress.completed.length === exercises.length && (
            <div className="course-finished">
              <Trophy size={24} />
              <div>
                <strong>You built the foundations.</strong>
                <p>
                  Take your Button into VS Code and build something of your own.
                </p>
              </div>
            </div>
          )}
          <footer className="lesson-footer">
            <button
              className="previous-lesson"
              disabled={index === 0}
              onClick={() => select(exercises[index - 1].id)}
            >
              <ArrowLeft size={15} />
              Previous lesson
            </button>
            {index < exercises.length - 1 ? (
              <button
                className="next-lesson"
                onClick={() => select(exercises[index + 1].id)}
              >
                Next lesson
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="next-lesson"
                onClick={() => select(exercises[0].id)}
              >
                Back to the beginning
                <ArrowRight size={15} />
              </button>
            )}
          </footer>
        </main>
      </div>
      {(reset || solutionConfirm) && (
        <div className="modal-backdrop">
          <section
            className="confirmation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <button
              className="dialog-close icon-button"
              aria-label="Close dialog"
              onClick={() => {
                setReset(null);
                setSolutionConfirm(false);
              }}
            >
              <X size={18} />
            </button>
            <span className="dialog-icon">
              {reset ? <RotateCcw size={23} /> : <Lightbulb size={23} />}
            </span>
            <h2 id="dialog-title">
              {reset === "course"
                ? "Start the course fresh?"
                : reset
                  ? "Reset this exercise?"
                  : "Take a look at the solution?"}
            </h2>
            <p>
              {reset === "course"
                ? "This removes all saved code and completed exercises from this browser."
                : reset
                  ? "Your current code and answers for this exercise will be replaced with the starter version."
                  : "The working answer will replace your current draft. Reset afterward to try the exercise independently."}
            </p>
            <div>
              <button
                autoFocus
                className="button-secondary"
                onClick={() => {
                  setReset(null);
                  setSolutionConfirm(false);
                }}
              >
                Keep practicing
              </button>
              <button
                className="button-primary"
                onClick={reset ? performReset : showSolution}
              >
                {reset ? "Reset" : "Show solution"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
