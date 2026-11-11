"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Download,
  Flag,
  FlaskConical,
  Lightbulb,
  Menu,
  Monitor,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/python/Dialog";
import { messages } from "@/lib/student/cloud";
import { cardDocument } from "@/lib/web-lab/document";
import { checkExercise, type CheckResult } from "@/lib/web-lab/checks";
import {
  exercises,
  findExercise,
  lessons,
  type ExerciseId,
  type Files,
  type LessonId,
} from "@/lib/web-lab/lessons";
import {
  exerciseDraft,
  maxCodeLength,
  starterFiles,
  type Progress,
} from "@/lib/web-lab/progress";
import LessonReading from "./LessonReading";
import WebEditor from "./WebEditor";
import styles from "./web-lab.module.css";

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
type View = "exercises" | "lessons" | "play";
type Run = { id: number; exerciseId: ExerciseId; files: Files; check: boolean };

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
  const exercise = findExercise(progress.active);
  const topic = lessons.find(({ id }) => id === exercise.topic) ?? lessons[0];
  const draft = exerciseDraft(progress, exercise.id);
  const [view, setView] = useState<View>("exercises");
  const [expanded, setExpanded] = useState<LessonId | null>(exercise.topic);
  const [readingTopic, setReadingTopic] = useState<LessonId>(exercise.topic);
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState<keyof Files>(exercise.file);
  const [outputTab, setOutputTab] = useState<"preview" | "checks">("preview");
  const [hints, setHints] = useState(0);
  const [modal, setModal] = useState<
    "progress" | "reference" | "solution" | null
  >(null);
  const [run, setRun] = useState<Run | null>(null);
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const serial = useRef(0);
  const latest = useRef(progress);
  useLayoutEffect(() => {
    latest.current = progress;
  }, [progress]);
  const free = view === "play";
  const files = free ? progress.playground : draft.files;
  const completed = progress.completed.includes(exercise.id);
  const index = exercises.findIndex(({ id }) => id === exercise.id);
  const percent = Math.round(
    (progress.completed.length / exercises.length) * 100,
  );
  const preview = useMemo(
    () => (run ? cardDocument(run.files, sampleImage, document).html : ""),
    [run, sampleImage],
  );
  const expected = cardDocument(exercise.solution, sampleImage, document).html;
  const changed =
    run !== null && JSON.stringify(files) !== JSON.stringify(run.files);

  function clearRun() {
    serial.current++;
    setRun(null);
    setChecks(null);
    setFeedback("");
    setChecking(false);
    setOutputTab("preview");
  }

  function selectExercise(id: ExerciseId) {
    window.scrollTo(0, 0);
    const selected = findExercise(id);
    onChange({ ...latest.current, active: id });
    setFile(selected.file);
    setExpanded(selected.topic);
    setReadingTopic(selected.topic);
    setView("exercises");
    setMenuOpen(false);
    setHints(0);
    setModal(null);
    clearRun();
  }

  function selectView(next: View) {
    window.scrollTo(0, 0);
    setView(next);
    setMenuOpen(false);
    if (next === "lessons") setReadingTopic(exercise.topic);
    if (next === "play") setFile("index.html");
    clearRun();
  }

  function edit(code: string) {
    const updated = { ...files, [file]: code.slice(0, maxCodeLength) };
    if (free) onChange({ ...latest.current, playground: updated });
    else
      onChange({
        ...latest.current,
        completed: latest.current.completed.filter((id) => id !== exercise.id),
        drafts: {
          ...latest.current.drafts,
          [exercise.id]: { ...draft, files: updated },
        },
      });
    setChecks(null);
    setFeedback("");
    setChecking(false);
    serial.current++;
  }

  function execute(check = false) {
    const id = ++serial.current;
    setChecks(null);
    setFeedback("");
    setChecking(check);
    setOutputTab(check ? "checks" : "preview");
    setRun({ id, exerciseId: exercise.id, files: { ...files }, check });
  }

  function loaded(frame: HTMLIFrameElement) {
    if (!run?.check || serial.current !== run.id || !frame.contentDocument)
      return;
    const current = latest.current;
    const currentDraft = exerciseDraft(current, run.exerciseId);
    if (JSON.stringify(currentDraft.files) !== JSON.stringify(run.files))
      return;
    const results = checkExercise(
      findExercise(run.exerciseId),
      frame.contentDocument,
    );
    const passed = results.every((result) => result.passed);
    setChecks(results);
    setChecking(false);
    if (passed) {
      setFeedback(
        currentDraft.viewedSolution
          ? "Шалгалт зөв. Бие даан хийхийн тулд дахин эхлүүлж оролдоорой."
          : "Зөв хийлээ! Үр дүнгээ хараад дараагийн дасгалд ороорой.",
      );
      if (!currentDraft.viewedSolution)
        onChange({
          ...current,
          completed: [...new Set([...current.completed, run.exerciseId])],
        });
    } else setFeedback("Дутуу хэсгээ доорх шалгалтаас хараад кодоо засаарай.");
  }

  function revealSolution() {
    onChange({
      ...latest.current,
      completed: latest.current.completed.filter((id) => id !== exercise.id),
      drafts: {
        ...latest.current.drafts,
        [exercise.id]: { ...draft, viewedSolution: true },
      },
    });
    setModal("solution");
  }

  function reset() {
    if (!window.confirm("Энэ дасгалын кодыг эхний хувилбараар солих уу?"))
      return;
    if (free) onChange({ ...latest.current, playground: starterFiles });
    else
      onChange({
        ...latest.current,
        completed: latest.current.completed.filter((id) => id !== exercise.id),
        drafts: {
          ...latest.current.drafts,
          [exercise.id]: { files: exercise.starter, viewedSolution: false },
        },
      });
    setHints(0);
    clearRun();
  }

  function download() {
    const html = cardDocument(files, sampleImage, document).html;
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
      <header className={styles.topbar}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.mobileMenu}`}
          aria-label="Сэдвүүдийг нээх"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={21} />
        </button>
        <button
          type="button"
          className={styles.brand}
          onClick={() => selectView("exercises")}
        >
          <span className={styles.htmlMark}>
            <Code2 size={25} aria-hidden="true" />
          </span>
          <span>
            Код<span>Лаб</span>
          </span>
        </button>
        <span className={styles.courseLabel}>6–8-р анги · HTML &amp; CSS</span>
        <Link className={styles.chooser} href="/" prefetch={false}>
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Хичээл сонгох</span>
        </Link>
        <nav className={styles.topnav} aria-label="Үндсэн цэс">
          <button
            type="button"
            aria-current={view === "lessons" ? "page" : undefined}
            onClick={() => selectView("lessons")}
          >
            <BookOpen size={18} aria-hidden="true" />
            Хичээлүүд
          </button>
          <button
            type="button"
            aria-current={view === "exercises" ? "page" : undefined}
            onClick={() => selectView("exercises")}
          >
            <BookOpen size={18} aria-hidden="true" />
            Дасгал
          </button>
          <button
            type="button"
            aria-current={free ? "page" : undefined}
            onClick={() => selectView("play")}
          >
            <FlaskConical size={18} aria-hidden="true" />
            Чөлөөт код
          </button>
        </nav>
        <button
          type="button"
          className={styles.studentButton}
          onClick={onSwitchStudent}
        >
          <span>
            <small>Сурагч солих</small>
            <strong>{student}</strong>
          </span>
          <RotateCcw size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.progressButton}
          aria-label={`Миний ахиц ${progress.completed.length}/${exercises.length}`}
          onClick={() => setModal("progress")}
        >
          <BarChart3 size={18} aria-hidden="true" />
          <span>Миний ахиц</span>
          <b>
            {progress.completed.length}/{exercises.length}
          </b>
        </button>
      </header>
      <div className={styles.appBody}>
        {menuOpen && (
          <button
            type="button"
            className={styles.menuBackdrop}
            aria-label="Сэдвүүдийг хаах"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside
          className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
          aria-label="Хичээлийн сэдвүүд"
        >
          <div className={styles.sideHeading}>
            ХИЧЭЭЛИЙН СЭДВҮҮД
            <button
              type="button"
              className={`${styles.iconButton} ${styles.mobileMenu}`}
              onClick={() => setMenuOpen(false)}
              aria-label="Цэс хаах"
            >
              <X size={19} />
            </button>
          </div>
          <nav className={styles.topicList} aria-label="Дасгалууд">
            {lessons.map((lesson, topicIndex) => {
              const list = exercises.filter(({ topic }) => topic === lesson.id);
              const done = list.filter(({ id }) =>
                progress.completed.includes(id),
              ).length;
              const open = expanded === lesson.id;
              return (
                <div key={lesson.id} className={styles.topicGroup}>
                  <button
                    type="button"
                    className={styles.topicToggle}
                    aria-expanded={open}
                    onClick={() => {
                      setExpanded(
                        open && view !== "lessons" ? null : lesson.id,
                      );
                      if (view === "lessons") {
                        window.scrollTo(0, 0);
                        setReadingTopic(lesson.id);
                        setMenuOpen(false);
                      }
                    }}
                  >
                    <span
                      className={styles.topicNumber}
                      style={{ color: lesson.color }}
                    >
                      {String(topicIndex + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.topicInfo}>
                      <strong>{lesson.title}</strong>
                      <small>
                        {done}/{list.length} дасгал
                      </small>
                    </span>
                    {open ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </button>
                  {open && (
                    <div className={styles.exerciseList}>
                      {list.map(({ id, title }) => (
                        <button
                          key={id}
                          type="button"
                          aria-current={
                            id === exercise.id && view === "exercises"
                              ? "page"
                              : undefined
                          }
                          onClick={() => selectExercise(id)}
                        >
                          <span
                            className={styles.exerciseDot}
                            aria-hidden="true"
                          >
                            {progress.completed.includes(id) ? (
                              <Check size={13} aria-label="Дууссан" />
                            ) : (
                              "•"
                            )}
                          </span>
                          {title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className={styles.sideBottom}>
            <div className={styles.sideProgress}>
              <span>
                Миний гүйцэтгэл <strong>{percent}%</strong>
              </span>
              <progress
                aria-label="Нийт гүйцэтгэл"
                value={progress.completed.length}
                max={exercises.length}
              />
              <small>
                {progress.completed.length} / {exercises.length} дасгал дууссан
              </small>
            </div>
            <button
              type="button"
              className={styles.referenceButton}
              onClick={() => setModal("reference")}
            >
              <BookOpen size={18} aria-hidden="true" />
              Товч лавлах
            </button>
            <p>Код, ахиц таны ID-гаар серверт хадгалагдана.</p>
          </div>
        </aside>
        <main id="main-content" className={styles.workspace}>
          {view === "lessons" ? (
            <LessonReading
              topic={readingTopic}
              sampleImage={sampleImage}
              onPractice={selectExercise}
            />
          ) : (
            <>
              <div className={styles.workspaceHeading}>
                <div>
                  <p className={styles.breadcrumb}>
                    {free
                      ? "ТУРШИЛТЫН ТАЛБАР"
                      : `${topic.title} / Дасгал ${String(index + 1).padStart(2, "0")}`}
                  </p>
                  <h1>{free ? "Өөрийн кодыг туршаарай" : exercise.title}</h1>
                </div>
                {!free && (
                  <span className={styles.time}>
                    <Clock size={15} aria-hidden="true" />
                    {exercise.minutes} минут
                  </span>
                )}
              </div>
              <div className={styles.learningGrid}>
                <section
                  className={styles.instructions}
                  aria-labelledby="task-title"
                >
                  <div className={styles.panelTitle}>
                    <Flag size={20} aria-hidden="true" />
                    <h2 id="task-title">
                      {free ? "Туршаад суралцъя" : "Даалгавар"}
                    </h2>
                  </div>
                  <p className={styles.explanation}>
                    {free
                      ? "Сурсан div, h2, p, img тагуудаа ашиглан өөрийн санааг турш. HTML болон CSS-ээ бичээд ажиллуулаарай."
                      : exercise.explanation}
                  </p>
                  <ol className={styles.prompts}>
                    {(free
                      ? [
                          "Картын агуулгаа index.html-ийн body хэсэгт бич.",
                          "style.css-д өнгө, зай, хүрээгээ тохируул.",
                          "Ажиллуулаад үр дүнгээ хар. HTML файлаа татаж авч болно.",
                        ]
                      : exercise.prompt
                    ).map((prompt) => (
                      <li key={prompt}>{prompt}</li>
                    ))}
                  </ol>
                  {!free && (
                    <>
                      <figure className={styles.expected}>
                        <figcaption>ХҮЛЭЭГДЭЖ БУЙ ҮР ДҮН</figcaption>
                        <div
                          className={
                            exercise.solution["index.html"].includes("<img")
                              ? styles.targetCard
                              : styles.targetText
                          }
                        >
                          <iframe
                            title="Хүлээгдэж буй карт"
                            sandbox=""
                            srcDoc={expected}
                          />
                        </div>
                      </figure>
                      <div className={styles.helpActions}>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() =>
                            setHints(Math.min(hints + 1, exercise.hints.length))
                          }
                          disabled={hints === exercise.hints.length}
                        >
                          <Lightbulb size={16} aria-hidden="true" />
                          Санамж{" "}
                          <small>
                            {hints}/{exercise.hints.length}
                          </small>
                        </button>
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => selectView("lessons")}
                        >
                          Сэдэв давтах{" "}
                          <ArrowRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                      {hints > 0 && (
                        <div className={styles.hintBox}>
                          {exercise.hints.slice(0, hints).map((hint) => (
                            <p key={hint}>{hint}</p>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.solutionLink}
                        onClick={revealSolution}
                      >
                        Жишээ хариу харах
                      </button>
                    </>
                  )}
                  {free && (
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => setModal("reference")}
                    >
                      <BookOpen size={17} aria-hidden="true" />
                      Товч лавлах
                    </button>
                  )}
                </section>
                <section
                  className={styles.workbench}
                  aria-label="Код ба үр дүн"
                >
                  <div className={styles.editorCard}>
                    <div className={styles.editorToolbar}>
                      <div
                        className={styles.fileTabs}
                        role="group"
                        aria-label="Кодын файл"
                      >
                        {(["index.html", "style.css"] as const).map((name) => (
                          <button
                            type="button"
                            key={name}
                            aria-pressed={file === name}
                            onClick={() => setFile(name)}
                          >
                            <span
                              aria-hidden="true"
                              className={
                                name === "index.html"
                                  ? styles.fileHtml
                                  : styles.fileCss
                              }
                            >
                              {name === "index.html" ? "<>" : "#"}
                            </span>
                            {name}
                          </button>
                        ))}
                      </div>
                      <div className={styles.editorTools}>
                        <span
                          role="status"
                          className={status === "saved" ? styles.saved : ""}
                        >
                          {messages[status]}
                        </span>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label="Кодыг дахин эхлүүлэх"
                          title="Дахин эхлэх"
                          onClick={reset}
                        >
                          <RotateCcw size={17} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label="HTML татах"
                          title="HTML татах"
                          onClick={download}
                        >
                          <Download size={17} />
                        </button>
                      </div>
                    </div>
                    <WebEditor
                      key={`${free ? "play" : exercise.id}/${file}`}
                      file={file}
                      code={files[file]}
                      onChange={edit}
                      onRun={() => execute()}
                    />
                    <div className={styles.editorActions}>
                      <span className={styles.keyboardTip}>
                        ⌘ / Ctrl + Enter
                      </span>
                      <div>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() => execute()}
                        >
                          <Play size={16} aria-hidden="true" />
                          Ажиллуулах
                        </button>
                        {!free && (
                          <button
                            type="button"
                            className={styles.primary}
                            disabled={checking}
                            onClick={() => execute(true)}
                          >
                            <CheckCheck size={17} aria-hidden="true" />
                            {checking ? "Шалгаж байна…" : "Хариу шалгах"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.outputCard}>
                    <div
                      className={styles.outputTabs}
                      role="group"
                      aria-label="Үр дүнгийн самбар"
                    >
                      <button
                        type="button"
                        aria-pressed={outputTab === "preview"}
                        onClick={() => setOutputTab("preview")}
                      >
                        <Monitor size={17} aria-hidden="true" />
                        Үр дүн
                      </button>
                      {!free && (
                        <button
                          type="button"
                          aria-pressed={outputTab === "checks"}
                          onClick={() => setOutputTab("checks")}
                        >
                          <CheckCheck size={17} aria-hidden="true" />
                          Шалгалт
                          {checks && (
                            <small>
                              {checks.filter(({ passed }) => passed).length}/
                              {checks.length}
                            </small>
                          )}
                        </button>
                      )}
                      {changed && (
                        <span className={styles.changed}>
                          Код өөрчлөгдсөн · дахин ажиллуулаарай
                        </span>
                      )}
                    </div>
                    <div className={styles.outputBody}>
                      <div
                        className={styles.livePreview}
                        data-hidden={outputTab !== "preview"}
                        aria-hidden={outputTab !== "preview"}
                      >
                        {run ? (
                          <iframe
                            key={run.id}
                            title="Кодын үр дүн"
                            sandbox="allow-same-origin"
                            tabIndex={outputTab === "preview" ? 0 : -1}
                            srcDoc={preview}
                            onLoad={(event) => loaded(event.currentTarget)}
                          />
                        ) : (
                          <div className={styles.empty}>
                            <Monitor size={28} aria-hidden="true" />
                            <strong>Үр дүн энд харагдана</strong>
                            <p>Кодоо бичээд «Ажиллуулах» товчийг дараарай.</p>
                          </div>
                        )}
                      </div>
                      {outputTab === "checks" && (
                        <div className={styles.checkResults} aria-live="polite">
                          {checking ? (
                            <p>Кодыг ажиллуулж шалгаж байна…</p>
                          ) : checks ? (
                            <>
                              <p
                                className={
                                  checks.every(({ passed }) => passed)
                                    ? styles.success
                                    : styles.feedback
                                }
                              >
                                {feedback}
                              </p>
                              <ul>
                                {checks.map(({ label, passed }) => (
                                  <li
                                    key={label}
                                    className={
                                      passed ? styles.passed : styles.failed
                                    }
                                  >
                                    {passed ? (
                                      <Check size={17} aria-hidden="true" />
                                    ) : (
                                      <X size={17} aria-hidden="true" />
                                    )}
                                    <span>{label}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <p>
                              «Хариу шалгах» товчийг дарахад шалгалтын тайлбар
                              энд гарна.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {status === "conflict" && (
                    <div className={styles.saveWarning}>
                      <p>{messages.conflict}</p>
                      <button
                        type="button"
                        className={styles.secondary}
                        onClick={onRecover}
                      >
                        Хуулбараа татаж, серверээс ачаалах
                      </button>
                    </div>
                  )}
                  {status === "offline" && (
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={onSave}
                    >
                      Одоо хадгалах
                    </button>
                  )}
                </section>
              </div>
              {!free && (
                <footer className={styles.exerciseFooter}>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={index === 0}
                    onClick={() => selectExercise(exercises[index - 1].id)}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Өмнөх дасгал
                  </button>
                  <span>
                    {completed
                      ? "✓ Дасгал дууссан"
                      : draft.viewedSolution
                        ? "Жишээ үзсэн · дахин бие даан туршаарай"
                        : `Дасгал ${index + 1} / ${exercises.length}`}
                  </span>
                  {index < exercises.length - 1 ? (
                    <button
                      type="button"
                      className={completed ? styles.primary : styles.secondary}
                      onClick={() => selectExercise(exercises[index + 1].id)}
                    >
                      Дараагийн дасгал{" "}
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => setModal("progress")}
                    >
                      Миний ахиц <BarChart3 size={16} aria-hidden="true" />
                    </button>
                  )}
                </footer>
              )}
            </>
          )}
        </main>
      </div>
      {modal && (
        <Dialog
          title={
            modal === "progress"
              ? "Миний ахиц"
              : modal === "reference"
                ? "HTML & CSS · Товч лавлах"
                : "Жишээ хариу"
          }
          onClose={() => setModal(null)}
          wide
        >
          {modal === "progress" && (
            <div className={styles.progressList}>
              <p>
                {progress.completed.length} / {exercises.length} дасгал дууссан
              </p>
              {exercises.map(({ id, title }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => selectExercise(id)}
                >
                  <span>{title}</span>
                  {progress.completed.includes(id) ? (
                    <Check size={18} aria-label="Дууссан" />
                  ) : (
                    <ArrowRight size={16} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
          {modal === "reference" && (
            <div className={styles.referenceContent}>
              {lessons.slice(0, 4).map(({ id, title, concepts }) => (
                <section key={id}>
                  <h3>{title}</h3>
                  {concepts.map(({ code, text }) => (
                    <div key={code}>
                      <pre tabIndex={0}>{code}</pre>
                      <p>{text}</p>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
          {modal === "solution" && (
            <div className={styles.referenceContent}>
              <p>
                Жишээг уншаад өөрийн кодтой харьцуул. Дахин эхлүүлж бие даан
                хийвэл ахицад тооцогдоно.
              </p>
              <h3>index.html</h3>
              <pre tabIndex={0}>{exercise.solution["index.html"]}</pre>
              {exercise.solution["style.css"] && (
                <>
                  <h3>style.css</h3>
                  <pre tabIndex={0}>{exercise.solution["style.css"]}</pre>
                </>
              )}
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
