"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  RotateCcw,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { messages } from "@/lib/student/cloud";
import { cardDocument } from "@/lib/web-lab/document";
import {
  grades,
  lessonFor,
  lessons,
  type Grade,
  type Lesson,
  type LessonId,
} from "@/lib/web-lab/lessons";
import {
  maxCodeLength,
  openLesson,
  starterDraft,
  startingDraft,
  type Draft,
  type Files,
  type Progress,
} from "@/lib/web-lab/progress";
import styles from "./web-lab.module.css";

const fileTabs = ["index.html", "style.css"] as const;
const widths = [
  { label: "Тааруулах", value: "100%" },
  { label: "Утас 360", value: "360px" },
  { label: "Компьютер 720", value: "720px" },
] as const;

type Props = {
  student: string;
  progress: Progress;
  status: keyof typeof messages;
  sampleImage: string;
  onChange: (progress: Progress) => void;
  onSave: () => void;
  onRecover: () => void;
  onSwitchStudent: () => void;
};

function LessonGuide({
  lesson,
  step,
  example,
  completed,
  finalLesson,
  onStep,
  onFinish,
}: {
  lesson: Lesson;
  step: number;
  example: string;
  completed: boolean;
  finalLesson: boolean;
  onStep: (step: number) => void;
  onFinish: () => void;
}) {
  const current = lesson.steps[step];
  const lastStep = step === lesson.steps.length - 1;
  return (
    <section className={styles.guide} aria-labelledby="step-heading">
      <span className={styles.stepCount}>
        Алхам {step + 1} / {lesson.steps.length}
      </span>
      <h2 id="step-heading">{current.title}</h2>
      <p>{current.explanation}</p>
      <div className={styles.task}>
        <h3>Одоо бичээрэй</h3>
        <p>{current.write}</p>
      </div>
      <p className={styles.observe}>
        <strong>Үр дүнгээ хараарай</strong> {current.look}
      </p>
      {lastStep && (
        <p className={styles.check}>
          <strong>Өөрийгөө шалгаарай</strong> {lesson.check}
        </p>
      )}
      <details className={styles.resource}>
        <summary>Санамж</summary>
        <p>{lesson.hint}</p>
      </details>
      <details className={styles.resource}>
        <summary>Жишээ харах</summary>
        <div className={styles.example}>
          <span>{"<body> доторх код"}</span>
          <pre tabIndex={0}>{lesson.example.html}</pre>
          {lesson.example.css && (
            <>
              <span>style.css</span>
              <pre tabIndex={0}>{lesson.example.css}</pre>
            </>
          )}
          <iframe
            title="Жишээний үр дүн"
            sandbox=""
            srcDoc={example}
            loading="lazy"
          />
        </div>
      </details>
      <div className={styles.guideActions}>
        {step > 0 && (
          <button
            type="button"
            onClick={() => onStep(step - 1)}
            aria-label="Өмнөх алхам"
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
        )}
        {lastStep ? (
          <button
            type="button"
            className={styles.primary}
            onClick={onFinish}
            disabled={finalLesson && completed}
          >
            {finalLesson
              ? completed
                ? "Хичээл дууссан"
                : "Хичээлээ дуусгах"
              : "Дуусгаад үргэлжлүүлэх"}
            {finalLesson ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <ArrowRight size={16} aria-hidden="true" />
            )}
          </button>
        ) : (
          <button
            type="button"
            className={styles.primary}
            onClick={() => onStep(step + 1)}
          >
            Дараагийн алхам <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}

export default function Workspace({
  student,
  progress,
  status,
  sampleImage,
  onChange,
  onSave,
  onRecover,
  onSwitchStudent,
}: Props) {
  const [file, setFile] = useState<keyof Files>("index.html");
  const [panel, setPanel] = useState<"editor" | "preview">("editor");
  const [width, setWidth] = useState<(typeof widths)[number]["value"]>("100%");
  const { active, completed, grade } = progress;
  const lessonIndex = lessons.findIndex(({ id }) => id === active);
  const nextLesson = lessons[lessonIndex + 1];
  const lesson = useMemo(() => lessonFor(active, grade), [active, grade]);
  const draft = progress.drafts[active] ?? starterDraft;
  const files = useDeferredValue(draft.files);
  const preview = useMemo(
    () => cardDocument(files, sampleImage, document),
    [files, sampleImage],
  );
  const example = useMemo(
    () =>
      cardDocument(
        { "index.html": lesson.example.html, "style.css": lesson.example.css },
        sampleImage,
        document,
      ).html,
    [lesson, sampleImage],
  );

  function selectLesson(id: LessonId, current = progress) {
    onChange(openLesson(current, id));
    setFile(id === "box-model" ? "style.css" : "index.html");
    setPanel("editor");
  }

  function saveDraft(next: Draft) {
    onChange({ ...progress, drafts: { ...progress.drafts, [active]: next } });
  }

  function changeGrade(value: string) {
    const nextGrade: Grade =
      grades.find((choice) => String(choice) === value) ?? grade;
    onChange({ ...progress, grade: nextGrade });
  }

  function finishLesson() {
    const next = {
      ...progress,
      completed: completed.includes(active)
        ? completed
        : [...completed, active],
    };
    if (nextLesson) selectLesson(nextLesson.id, next);
    else onChange(next);
    onSave();
  }

  function resetDraft() {
    if (!window.confirm("Энэ хичээлийн кодыг эхний хувилбараар солих уу?"))
      return;
    onChange({
      ...progress,
      completed: completed.filter((id) => id !== active),
      drafts: { ...progress.drafts, [active]: startingDraft(progress, active) },
    });
  }

  function download() {
    const { html, hasContent } = cardDocument(
      draft.files,
      sampleImage,
      document,
    );
    if (!hasContent) return;
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-card.html";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" prefetch={false}>
          <ArrowLeft size={17} aria-hidden="true" /> Хичээл сонгох
        </Link>
        <div className={styles.account}>
          <span>{student}</span>
          <button type="button" onClick={onSwitchStudent}>
            Сурагч солих
          </button>
        </div>
      </header>
      <main id="main-content" className={styles.main}>
        <div className={styles.titleRow}>
          <div>
            <span className={styles.course}>HTML &amp; CSS · 6–8-р анги</span>
            <h1>{lesson.title}</h1>
          </div>
          <div className={styles.grade}>
            <label htmlFor="web-lab-grade">Миний анги</label>
            <select
              id="web-lab-grade"
              value={grade}
              onChange={(event) => changeGrade(event.target.value)}
            >
              {grades.map((value) => (
                <option key={value} value={value}>
                  {value}-р анги
                </option>
              ))}
            </select>
          </div>
        </div>
        <nav
          aria-label="HTML ба CSS-ийн таван хичээл"
          className={styles.lessons}
        >
          {lessons.map(({ id, shortTitle }, index) => (
            <button
              key={id}
              type="button"
              aria-current={id === active ? "step" : undefined}
              onClick={() => selectLesson(id)}
            >
              <span className={styles.lessonNumber}>
                {completed.includes(id) ? (
                  <Check size={15} aria-label="Дууссан" />
                ) : (
                  index + 1
                )}
              </span>
              {shortTitle}
            </button>
          ))}
        </nav>
        <div className={styles.workspace}>
          <LessonGuide
            key={active}
            lesson={lesson}
            step={draft.step}
            example={example}
            completed={completed.includes(active)}
            finalLesson={!nextLesson}
            onStep={(step) => saveDraft({ ...draft, step })}
            onFinish={finishLesson}
          />
          <div className={styles.lab}>
            <div
              className={styles.mobileTabs}
              role="group"
              aria-label="Код ба үр дүн"
            >
              <button
                type="button"
                aria-pressed={panel === "editor"}
                onClick={() => setPanel("editor")}
              >
                Код бичих
              </button>
              <button
                type="button"
                aria-pressed={panel === "preview"}
                onClick={() => setPanel("preview")}
              >
                Үр дүн
              </button>
            </div>
            <div className={styles.panes}>
              <section
                className={styles.panel}
                data-active={panel === "editor"}
                aria-label="Код бичих"
              >
                <div
                  className={styles.bar}
                  role="group"
                  aria-label="Кодын файл"
                >
                  {fileTabs.map((name) => (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={file === name}
                      onClick={() => setFile(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <textarea
                  key={file}
                  className={styles.editor}
                  aria-label={`${file} код бичих талбар`}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  maxLength={maxCodeLength}
                  value={draft.files[file]}
                  onChange={(event) =>
                    saveDraft({
                      ...draft,
                      files: { ...draft.files, [file]: event.target.value },
                    })
                  }
                />
              </section>
              <section
                className={styles.panel}
                data-active={panel === "preview"}
                aria-label="Шууд харагдац"
              >
                <div className={styles.bar}>
                  <div className={styles.previewWidth}>
                    <label htmlFor="web-lab-width">Харагдац</label>
                    <select
                      id="web-lab-width"
                      value={width}
                      onChange={(event) =>
                        setWidth(
                          widths.find(
                            ({ value }) => value === event.target.value,
                          )?.value ?? "100%",
                        )
                      }
                    >
                      {widths.map(({ label, value }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.preview}>
                  {!preview.hasContent && (
                    <p className={styles.empty}>
                      {"<body> дотор картаа бичихэд үр дүн энд гарна."}
                    </p>
                  )}
                  <iframe
                    title="Кодын шууд үр дүн"
                    sandbox=""
                    srcDoc={preview.html}
                    style={{ width }}
                  />
                </div>
              </section>
            </div>
            <div className={styles.footer}>
              <div className={styles.sync}>
                <span role="status">{messages[status]}</span>
                {status === "conflict" && (
                  <button type="button" onClick={onRecover}>
                    Хуулбараа татаж, серверээс ачаалах
                  </button>
                )}
                {(status === "saving" || status === "offline") && (
                  <button type="button" onClick={onSave}>
                    Одоо хадгалах
                  </button>
                )}
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={resetDraft}>
                  <RotateCcw size={15} aria-hidden="true" /> Дахин эхлэх
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={!preview.hasContent}
                >
                  <Download size={16} aria-hidden="true" /> HTML татах
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
