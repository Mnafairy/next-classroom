"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Expand,
  Play,
  ShieldCheck,
} from "lucide-react";
import { EXAM_MINUTES, EXAM_TITLE, EXAM_GRADE_LABEL } from "@/lib/exam/content";
import { hasCodeAnswer, type ExamAnswers } from "@/lib/exam/protocol";
import type { ExamResponse, ExamView } from "@/lib/exam/types";
import {
  examFetch,
  ExamSessionExpiredError,
  ExamRecoverySavedError,
} from "@/lib/exam/client";
import { createRunId } from "@/lib/course/run-id";
import {
  alternateDrafts,
  rememberDraft,
  savedDrafts,
  tabDraft,
} from "@/lib/exam/browser-drafts";
import { restoreExamDraft } from "@/lib/exam/draft";
import {
  mergeExamAnswers,
  sameExamAnswers,
  saveExamAnswers,
} from "@/lib/exam/sync";

const codeExtensions = [
  javascript(),
  EditorView.contentAttributes.of({ "aria-label": "JavaScript хариулт" }),
];
const editorSetup = { lineNumbers: true, foldGutter: false };
function remember(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* Browser storage is optional; server saves remain available. */
  }
}
async function request<T>(body?: Record<string, unknown>): Promise<T> {
  const r = await examFetch(body);
  const data = await r.json();
  return data;
}
export default function ExamWorkspace() {
  const [attempt, setAttempt] = useState<ExamView | null>(null),
    [loading, setLoading] = useState(true),
    [id, setId] = useState(""),
    [code, setCode] = useState(""),
    [alternates, setAlternates] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saveState, setSaveState] = useState(""),
    [index, setIndex] = useState(0),
    [now, setNow] = useState(0),
    [away, setAway] = useState(false),
    [output, setOutput] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<ExamAnswers>({
    choices: {},
    code: {},
  });
  const attemptRef = useRef<ExamView | null>(null),
    answersRef = useRef(answers),
    offset = useRef(0),
    queue = useRef<Promise<void>>(Promise.resolve()),
    confirmRef = useRef<HTMLDialogElement>(null),
    expirySent = useRef(false);
  const writerId = useRef("");
  const browserKey = useRef("");
  const install = useCallback((data: ExamResponse, chosen?: string | null) => {
    expirySent.current = false;
    setIndex(0);
    setOutput({});
    setAway(false);
    offset.current = data.serverNow - Date.now();
    attemptRef.current = data.attempt;
    setAttempt(data.attempt);
    setNow(data.serverNow);
    if (data.attempt?.status !== "active") confirmRef.current?.close();
    if (data.attempt) {
      const raw =
        chosen !== undefined
          ? chosen
          : data.attempt.status === "active"
            ? tabDraft(data.attempt)
            : null;
      const restored =
        data.attempt.status === "active"
          ? restoreExamDraft(data.attempt, raw)
          : null;
      setAlternates(
        data.attempt.status === "active"
          ? alternateDrafts(data.attempt, raw)
          : [],
      );
      if (chosen && data.attempt.status === "active") {
        writerId.current ||= createRunId();
        rememberDraft(data.attempt, writerId.current, chosen);
      }
      if (restored?.conflict && data.attempt.status === "active") {
        const baseline = {
          ...data.attempt,
          answers: restored.baseAnswers,
          revision: restored.revision,
        };
        attemptRef.current = baseline;
        setAttempt(baseline);
        setError(
          "Хөтөчийн ноорог хадгалсан хариултаас зөрлөө. Таны ажлыг хэвээр нээлээ. Дахин хадгалах эсвэл ажлаа татаж багшдаа өгнө үү.",
        );
      }
      answersRef.current =
        restored?.answers ||
        (data.attempt.status === "active"
          ? data.attempt.answers
          : { choices: {}, code: {} });
      setAnswers(answersRef.current);
      if (data.attempt.status === "active") remember("kodlab-exam-active", "1");
      else {
        remember("kodlab-exam-active", null);
      }
    } else {
      answersRef.current = { choices: {}, code: {} };
      setAnswers(answersRef.current);
      remember("kodlab-exam-active", null);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    request<ExamResponse>()
      .then(install)
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [install]);
  const save = useCallback(
    (submit = false) => {
      const requested = attemptRef.current;
      const next = queue.current
        .catch(() => {})
        .then(async () => {
          const current = attemptRef.current;
          if (
            !current ||
            current.status !== "active" ||
            current.studentId !== requested?.studentId ||
            current.generation !== requested.generation
          )
            return;
          setSaveState("Хадгалж байна…");
          const snapshot = answersRef.current;
          try {
            writerId.current ||= createRunId();
            const data = await saveExamAnswers(
              current,
              snapshot,
              submit,
              writerId.current,
            );
            if (!data) {
              setSaveState("Хадгалсан");
              setError("");
              return;
            }
            if (!data.attempt) throw new Error("Шалгалтын холболт тасарлаа.");
            const nextAnswers =
              data.attempt.status !== "active"
                ? answersRef.current
                : mergeExamAnswers(
                    snapshot,
                    answersRef.current,
                    data.attempt.answers,
                  );
            offset.current = data.serverNow - Date.now();
            attemptRef.current = data.attempt;
            setAttempt(data.attempt);
            answersRef.current = nextAnswers;
            setAnswers(nextAnswers);
            setError("");
            if (data.attempt.status !== "active") {
              remember("kodlab-exam-active", null);
              if (document.fullscreenElement)
                void document.exitFullscreen().catch(() => {});
            } else {
              rememberDraft(
                current,
                writerId.current,
                sameExamAnswers(nextAnswers, data.attempt.answers)
                  ? null
                  : JSON.stringify({
                      revision: data.attempt.revision,
                      generation: current.generation,
                      baseAnswers: data.attempt.answers,
                      answers: answersRef.current,
                    }),
              );
            }
            setSaveState(
              data.attempt.status !== "active" ||
                sameExamAnswers(nextAnswers, data.attempt.answers)
                ? "Хадгалсан"
                : "Өөрчлөлт хадгалагдаж байна…",
            );
          } catch (e) {
            if (e instanceof ExamRecoverySavedError) {
              try {
                const latest = await request<ExamResponse>();
                if (
                  latest.attempt?.studentId === current.studentId &&
                  latest.attempt.generation === current.generation &&
                  latest.attempt.status !== "active"
                )
                  install(latest);
              } catch {
                /* Keep the local draft and original recovery message. */
              }
            }
            if (e instanceof ExamSessionExpiredError) {
              attemptRef.current = null;
              setAttempt(null);
              setId(current.studentId);
              remember("kodlab-exam-active", null);
            }
            setSaveState("Хадгалагдаагүй");
            setError(
              e instanceof Error
                ? e.message
                : "Холболтоо шалгаад дахин хадгалаарай.",
            );
            throw e;
          }
        });
      queue.current = next;
      return next;
    },
    [install],
  );
  const active = attempt?.status === "active";
  useEffect(() => {
    const current = attemptRef.current;
    if (!active || current?.status !== "active") return;
    if (sameExamAnswers(answers, current.answers)) return;
    const timer = setTimeout(() => void save().catch(() => {}), 1200);
    return () => clearTimeout(timer);
  }, [answers, active, save]); // A response revision must not schedule another save.
  useEffect(() => {
    if (!active) return;
    const tick = setInterval(() => setNow(Date.now() + offset.current), 1000);
    const retry = setInterval(() => void save().catch(() => {}), 30000);
    function depart() {
      if (attemptRef.current?.status !== "active") return;
      setAway(true);
      void fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "departure",
          studentId: attemptRef.current.studentId,
          generation: attemptRef.current.generation,
        }),
        keepalive: true,
      }).catch(() => {});
      void save().catch(() => {});
    }
    function visibility() {
      if (document.hidden) depart();
      else setNow(Date.now() + offset.current);
    }
    function fullscreen() {
      if (!document.fullscreenElement) depart();
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("blur", depart);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", fullscreen);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      clearInterval(tick);
      clearInterval(retry);
      window.removeEventListener("blur", depart);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", fullscreen);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [active, save]);
  const remaining =
    attempt?.status === "active"
      ? Math.max(
          0,
          Math.ceil((new Date(attempt.deadline).getTime() - now) / 1000),
        )
      : EXAM_MINUTES * 60;
  useEffect(() => {
    if (active && remaining === 0 && !expirySent.current) {
      expirySent.current = true;
      void save(true).catch(() => {
        expirySent.current = false;
      });
    }
  }, [active, remaining, save]);
  function change(next: ExamAnswers) {
    if (busy || remaining === 0) return;
    answersRef.current = next;
    setAnswers(next);
    setSaveState("Өөрчлөлт хадгалагдаж байна…");
    const current = attemptRef.current;
    if (current?.status === "active")
      rememberDraft(
        current,
        (writerId.current ||= createRunId()),
        JSON.stringify({
          revision: current.revision,
          generation: current.generation,
          baseAnswers: current.answers,
          answers: next,
        }),
      );
  }
  function downloadAnswers() {
    const current = attemptRef.current;
    if (current?.status !== "active") return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              studentId: current.studentId,
              generation: current.generation,
              revision: current.revision,
              baseAnswers: current.answers,
              answers: answersRef.current,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `kodlab-exam-${current.studentId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadLocalDraft() {
    const current = attemptRef.current;
    if (!current) return;
    try {
      const drafts = savedDrafts(current);
      if (!drafts.length) {
        setError("Энэ хөтөчид өмнөх ноорог олдсонгүй. Багшдаа хандана уу.");
        return;
      }
      const url = URL.createObjectURL(
        new Blob(
          [drafts.length === 1 ? drafts[0] : "[" + drafts.join(",") + "]"],
          { type: "application/json" },
        ),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `kodlab-exam-draft-${current.studentId}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(
        "Нооргоо татаж чадсангүй. Энэ хуудсаа хаалгүй багшдаа хандана уу.",
      );
    }
  }
  async function recoverSavedAnswers(draft?: string) {
    setBusy(true);
    try {
      await queue.current.catch(() => {});
      const current = attemptRef.current;
      const data = await request<ExamResponse>();
      if (
        !current ||
        data.attempt?.studentId !== current.studentId ||
        data.attempt.generation !== current.generation
      )
        throw new Error(
          "Энэ цонхны сурагчийн нэвтрэлт өөрчлөгдсөн. Ажлаа татаж аваад хуудсаа дахин нээнэ үү.",
        );
      if (
        current.status === "active" &&
        (!draft || !sameExamAnswers(answersRef.current, current.answers))
      )
        downloadAnswers();
      if (draft) {
        // Keep the previous draft's local backup when switching versions.
        writerId.current = createRunId();
      } else if (current.status === "active")
        rememberDraft(current, writerId.current, null);
      install(data, draft ?? null);
      if (!draft) setError("");
      setSaveState(draft ? "Нооргийг нээлээ" : "Хадгалсан хариултыг нээлээ");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Холболтоо шалгаарай.");
    } finally {
      setBusy(false);
    }
  }
  async function start(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const claimKey = "kodlab-exam-login:" + id.trim().toUpperCase();
      browserKey.current ||= createRunId();
      try {
        // An interrupted first response can be retried from this tab after a reload.
        browserKey.current =
          window.sessionStorage.getItem(claimKey) || browserKey.current;
        window.sessionStorage.setItem(claimKey, browserKey.current);
      } catch {
        /* The in-memory key still covers retries while open. */
      }
      install(
        await request<ExamResponse>({
          action: "start",
          studentId: id,
          code: code.trim(),
          browserKey: browserKey.current,
        }),
      );
      setCode("");
      browserKey.current = "";
      try {
        window.sessionStorage.removeItem(claimKey);
      } catch {
        /* Storage is optional. */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }
  async function nextStudent() {
    setBusy(true);
    setError("");
    try {
      await queue.current.catch(() => {});
      const current = attemptRef.current;
      if (!current) return;
      install(
        await request<ExamResponse>({
          action: "next-student",
          studentId: current.studentId,
          generation: current.generation,
        }),
      );
      setId("");
      setSaveState("");
      writerId.current = "";
      confirmRef.current?.close();
      requestAnimationFrame(() =>
        document.getElementById("exam-student")?.focus(),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }
  async function fullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setAway(false);
    } catch {
      setError(
        "Бүтэн дэлгэц дэмжихгүй байна. Шалгалтын энэ хуудсандаа ажиллаарай.",
      );
    }
  }
  async function sample(exerciseId: string) {
    setBusy(true);
    try {
      const data = await request<{ output: string[] }>({
        action: "sample",
        studentId: attemptRef.current?.studentId,
        generation: attemptRef.current?.generation,
        exerciseId,
        code: answersRef.current.code[exerciseId] || "",
      });
      setOutput((p) => ({
        ...p,
        [exerciseId]: data.output.join("\n") || "Гаралт алга.",
      }));
    } catch (e) {
      setOutput((p) => ({
        ...p,
        [exerciseId]: e instanceof Error ? e.message : "Кодоо шалгана уу.",
      }));
    } finally {
      setBusy(false);
    }
  }
  const questions = active ? attempt.questions : [],
    exercises = active ? attempt.exercises : [];
  const answered =
    questions.filter((q) => answers.choices[q.id] !== undefined).length +
    exercises.filter((e) => hasCodeAnswer(e.starter, answers.code[e.id]))
      .length;
  const q = questions[index],
    e = exercises[index - questions.length];
  const total = questions.length + exercises.length;
  return (
    <div className="exam-page">
      <header className="exam-header">
        <span className="exam-brand">
          <Code2 size={23} /> КодЛаб.
        </span>
        <span>
          {active
            ? `${attempt.className} · ${attempt.name}`
            : `${EXAM_GRADE_LABEL} · JavaScript`}
        </span>
        {active && (
          <div
            className={`exam-timer ${remaining <= 300 ? "urgent" : ""}`}
            role="timer"
            aria-label="Үлдсэн хугацаа"
          >
            <Clock3 size={18} />
            {Math.floor(remaining / 60)
              .toString()
              .padStart(2, "0")}
            :{(remaining % 60).toString().padStart(2, "0")}
          </div>
        )}
      </header>
      <main id="main-content" className={active ? "exam-layout" : "exam-entry"}>
        {loading ? (
          <p role="status">Шалгалтыг ачаалж байна…</p>
        ) : !attempt ? (
          <section className="exam-intro">
            <ShieldCheck size={30} />
            <p className="exam-kicker">БАГШИЙН КОДТОЙ ҮНЭЛГЭЭ</p>
            <h1>{EXAM_TITLE}</h1>
            <p>Мэдлэгээ шалгаад, зургаан жижиг бодлогыг кодоор шийдээрэй.</p>
            <dl className="exam-facts">
              <div>
                <dt>Хугацаа</dt>
                <dd>{EXAM_MINUTES} минут</dd>
              </div>
              <div>
                <dt>Тест</dt>
                <dd>20 × 2 оноо</dd>
              </div>
              <div>
                <dt>Код</dt>
                <dd>6 × 10 оноо</dd>
              </div>
            </dl>
            <ul>
              <li>
                Эхлүүлсэн мөчөөс хугацаа тоологдоно. Дахин өгөх эрхийг багш
                нээнэ.
              </li>
              <li>
                Хариулт автоматаар хадгалагдана. Хуудсаа шинэчилсэн ч хугацаа
                дахин эхлэхгүй.
              </li>
              <li>
                Шалгалт идэвхтэй үед КодЛабын бусад хуудас түгжигдэнэ. Өөр таб,
                цонх руу шилжсэн үйлдэл багшид бүртгэгдэнэ.
              </li>
              <li>
                Хугацаа дуусвал хамгийн сүүлд серверт хадгалсан хариултаар
                үнэлнэ. Оноог багшийн орчинд харна.
              </li>
              <li>
                Кодод let, =, арифметик, if / else, &&, ||, console.log
                ашиглана. Жишээг ажиллуулах нь зөвхөн өгсөн оролтыг шалгана.
              </li>
            </ul>
            <form onSubmit={start}>
              <label htmlFor="exam-student">Сурагчийн ID</label>
              <input
                id="exam-student"
                value={id}
                onChange={(ev) => setId(ev.target.value)}
                placeholder="Жишээ: 19S0203"
                autoComplete="off"
                required
                maxLength={40}
              />
              <label htmlFor="exam-access">
                Багшаас авсан нэг удаагийн код
              </label>
              <input
                id="exam-access"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={20}
                autoComplete="one-time-code"
                spellCheck={false}
              />
              <button className="exam-primary" disabled={busy}>
                {busy ? "Нээж байна…" : "Шалгалт эхлүүлэх / үргэлжлүүлэх"}
                <ArrowRight size={17} />
              </button>
            </form>
            {error && (
              <p role="alert" className="exam-error">
                {error}
              </p>
            )}
            <Link href="/practice-tests" className="exam-link" prefetch={false}>
              Тайлбартай давтлагын тестүүд
            </Link>
            <Link href="/" className="exam-link">
              Хичээл сонгох руу буцах
            </Link>
          </section>
        ) : !active ? (
          <section className="exam-intro">
            <Check size={34} />
            <h1>
              {attempt.status === "expired"
                ? "Шалгалтын хугацаа дууссан"
                : "Шалгалтаа илгээлээ"}
            </h1>
            <p>
              {attempt.name} · {attempt.studentId} · {attempt.className}
            </p>
            <p>
              Таны хадгалсан тестийн хариулт болон код багшид очсон. Дахин өгөх
              шаардлагатай бол багшдаа хандаарай.
            </p>
            <button
              className="exam-primary"
              disabled={busy}
              onClick={() => void nextStudent()}
            >
              {busy ? "Нээж байна…" : "Дараагийн сурагч"}{" "}
              <ArrowRight size={17} />
            </button>
            <p>
              Дараагийн сурагч өөрийн ID болон багшийн олгосон кодоор нэвтэрнэ.
              Таны шалгалтын дүн хадгалагдсан хэвээр үлдэнэ.
            </p>
            <p>
              Хадгалалт алдаатай байсан бол энэ хөтөчид үлдсэн нооргоо татаж
              багшдаа өгнө үү.
            </p>
            <button className="exam-secondary" onClick={downloadLocalDraft}>
              Хөтөчийн нооргийг татах
            </button>
            {error && (
              <p role="alert" className="exam-error">
                {error}
              </p>
            )}
            <Link href="/" className="exam-link">
              Хичээлүүд рүү буцах <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            <aside className="exam-navigation">
              <h1>JavaScript шалгалт</h1>
              <p>{answered} / 26 хариулсан</p>
              <progress value={answered} max={26} />
              <h2>Тест · 40 оноо</h2>
              <div className="exam-numbers">
                {questions.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIndex(i);
                      setError("");
                    }}
                    className={`${index === i ? "current" : ""} ${answers.choices[item.id] !== undefined ? "answered" : ""}`}
                    aria-label={`Тест ${i + 1}${answers.choices[item.id] !== undefined ? ", хариулсан" : ""}`}
                    aria-current={index === i ? "step" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <h2>Код · 60 оноо</h2>
              <div className="exam-numbers">
                {exercises.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setIndex(questions.length + i)}
                    className={`${index === questions.length + i ? "current" : ""} ${hasCodeAnswer(item.starter, answers.code[item.id]) ? "answered" : ""}`}
                    aria-label={`Код ${i + 1}: ${item.title}`}
                    aria-current={
                      index === questions.length + i ? "step" : undefined
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => void fullscreen()}
                className="exam-secondary"
              >
                <Expand size={16} />
                Бүтэн дэлгэц
              </button>
              <small>Өөр хуудас руу шилжихгүйгээр энд ажиллаарай.</small>
            </aside>
            <section className="exam-work">
              <div className="exam-work-top">
                <span>
                  {q
                    ? `Тест ${index + 1} / 20 · 2 оноо`
                    : `Код ${index - questions.length + 1} / 6 · 10 оноо`}
                </span>
                <span
                  role="status"
                  className={saveState === "Хадгалагдаагүй" ? "exam-error" : ""}
                >
                  {saveState}
                </span>
              </div>
              {alternates.length > 0 && (
                <details>
                  <summary>
                    Энэ хөтчид хадгалсан бусад ноорог ({alternates.length})
                  </summary>
                  {alternates.map((raw, i) => (
                    <button
                      key={raw}
                      disabled={busy}
                      onClick={() => void recoverSavedAnswers(raw)}
                    >
                      Ноорог {i + 1} нээх
                    </button>
                  ))}
                </details>
              )}
              {away && (
                <div className="exam-warning" role="status">
                  Шалгалтын цонхноос шилжсэн үйлдэл бүртгэгдлээ. Энэ хуудсандаа
                  үргэлжлүүлээрэй.
                  <button
                    onClick={() => setAway(false)}
                    aria-label="Мэдэгдэл хаах"
                  >
                    ×
                  </button>
                </div>
              )}
              {error && (
                <div role="alert" className="exam-error">
                  {error}{" "}
                  <button onClick={() => void save().catch(() => {})}>
                    Дахин хадгалах
                  </button>
                  <button onClick={downloadAnswers}>
                    Энэ цонхны ажлыг татах
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void recoverSavedAnswers()}
                  >
                    Ажлаа татаж, хадгалсан хариултыг нээх
                  </button>
                </div>
              )}
              {q ? (
                <div className="exam-question">
                  <h2>{q.prompt}</h2>
                  {q.code && <pre>{q.code}</pre>}
                  <fieldset disabled={busy || remaining === 0}>
                    <legend className="sr-only">
                      Нэг зөв хариулт сонгоно уу
                    </legend>
                    {q.options.map((option, i) => (
                      <label
                        className={answers.choices[q.id] === i ? "chosen" : ""}
                        key={i}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers.choices[q.id] === i}
                          onChange={() =>
                            change({
                              ...answersRef.current,
                              choices: {
                                ...answersRef.current.choices,
                                [q.id]: i,
                              },
                            })
                          }
                        />
                        <span className="exam-option-letter">{"ABCD"[i]}</span>
                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>
                </div>
              ) : e ? (
                <div className="exam-question">
                  <h2>{e.title}</h2>
                  <p>{e.prompt}</p>
                  <p className="exam-example">Жишээ: {e.example}</p>
                  <label htmlFor="exam-code">Таны JavaScript код</label>
                  <CodeMirror
                    id="exam-code"
                    value={answers.code[e.id] || ""}
                    extensions={codeExtensions}
                    editable={!busy && remaining > 0}
                    minHeight="260px"
                    maxHeight="500px"
                    aria-label="JavaScript хариулт"
                    onChange={(code) => {
                      setOutput((previous) => {
                        const next = { ...previous };
                        delete next[e.id];
                        return next;
                      });
                      change({
                        ...answersRef.current,
                        code: { ...answersRef.current.code, [e.id]: code },
                      });
                    }}
                    basicSetup={editorSetup}
                  />
                  <div className="exam-code-actions">
                    <button
                      className="exam-secondary"
                      disabled={busy || remaining === 0}
                      onClick={() => void sample(e.id)}
                    >
                      <Play size={15} />
                      Жишээг ажиллуулах
                    </button>
                    <span>Далд оролтуудыг илгээсний дараа шалгана.</span>
                  </div>
                  {output[e.id] !== undefined && (
                    <pre className="exam-output" aria-live="polite">
                      {output[e.id]}
                    </pre>
                  )}
                </div>
              ) : null}
              <footer className="exam-actions">
                <button
                  className="exam-secondary"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                >
                  <ArrowLeft size={16} />
                  Өмнөх
                </button>
                {index < total - 1 ? (
                  <button
                    className="exam-primary"
                    onClick={() => setIndex((i) => i + 1)}
                  >
                    Дараах
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="exam-primary"
                    onClick={() => confirmRef.current?.showModal()}
                  >
                    Шалгалт илгээх
                    <Check size={16} />
                  </button>
                )}
              </footer>
              {index < total - 1 && (
                <button
                  className="exam-finish-link"
                  onClick={() => confirmRef.current?.showModal()}
                >
                  Шалгалт дуусгаж илгээх
                </button>
              )}
            </section>
          </>
        )}
      </main>
      <dialog
        ref={confirmRef}
        className="exam-modal"
        aria-labelledby="exam-confirm-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <h2 id="exam-confirm-title">Шалгалтаа илгээх үү?</h2>
        <p>
          26-аас {answered} даалгаварт хариулсан. Илгээсний дараа хариултаа
          засах боломжгүй.
        </p>
        <div className="exam-actions">
          <button
            className="exam-secondary"
            disabled={busy}
            onClick={() => confirmRef.current?.close()}
          >
            Үргэлжлүүлэх
          </button>
          <button
            className="exam-primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await save(true);
                confirmRef.current?.close();
              } catch {
                /* Keep the dialog open so the student can retry. */
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Илгээж байна…" : "Илгээх"}
          </button>
        </div>
        {error && (
          <p role="alert" className="exam-error">
            {error}
          </p>
        )}
      </dialog>
    </div>
  );
}
