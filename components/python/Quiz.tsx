"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCheck,
  ClipboardCheck,
  RotateCcw,
  X,
} from "lucide-react";
import { modules } from "@/lib/python/course";
import { questions } from "@/lib/python/questions";
import { updateProgress } from "@/lib/python/state";
import type { StudentProgress } from "@/lib/python/types";
import { useState } from "react";

export default function Quiz({
  progress,
  onReview,
}: {
  progress: StudentProgress;
  onReview: (module: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const group =
    selected === "all"
      ? questions
      : questions.filter((question) => String(question.module) === selected);
  const attempt = progress.quizAttempts[selected ?? ""] ?? {
    answers: {},
    submitted: false,
  };
  const score = group.filter(
    (question) => attempt.answers[question.id] === question.answer,
  ).length;

  function change(question: string, answer: number) {
    if (!selected || attempt.submitted) return;
    updateProgress((current) => ({
      ...current,
      quizAttempts: {
        ...current.quizAttempts,
        [selected]: {
          submitted: false,
          answers: { ...attempt.answers, [question]: answer },
        },
      },
    }));
    setNotice("");
  }

  function submit() {
    if (group.some((question) => attempt.answers[question.id] === undefined)) {
      setNotice("Бүх асуултад хариулаад шалгаарай.");
      return;
    }
    updateProgress((current) => ({
      ...current,
      quizAttempts: {
        ...current.quizAttempts,
        [selected!]: { ...attempt, submitted: true },
      },
    }));
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (selected === null)
    return (
      <main id="main-content" className="py-main py-tests">
        <div className="py-eyebrow">МЭДЛЭГЭЭ ШАЛГАЯ</div>
        <h1>Юу сурснаа туршъя.</h1>
        <p className="py-subtitle">
          Кодын гаралтыг тааж, нөхцөлөө сонгож, алдааг олоорой.
        </p>
        <div className="py-quiz-hero">
          <div>
            <span className="py-eyebrow">БҮХ СЭДЭВ</span>
            <h2>Python-оо хэр сайн мэдэх вэ?</h2>
            <p>Хувьсагчаас давхар давталт хүртэлх {questions.length} асуулт.</p>
            <div className="py-quiz-meta">
              <span>
                <ClipboardCheck size={16} /> {questions.length} асуулт
              </span>
              <span>~15 минут · Хугацааны хязгааргүй</span>
            </div>
            <button className="py-primary" onClick={() => setSelected("all")}>
              Нэгдсэн сорил эхлэх <ArrowRight size={17} />
            </button>
          </div>
          <div className="py-quiz-art" aria-hidden="true">
            <span>?</span>
            <code>
              if санаа:
              <br />
              &nbsp; туршаад_үз()
            </code>
          </div>
        </div>
        <div className="py-section-label">
          <h2>Сэдвээр сорих</h2>
          <span>Тус бүр 3 асуулт</span>
        </div>
        <div className="py-quiz-grid">
          {modules.map((module, index) => {
            const saved = progress.quizAttempts[String(index)];
            const correct = questions.filter(
              (question) =>
                question.module === index &&
                saved?.answers[question.id] === question.answer,
            ).length;
            return (
              <button
                key={module.title}
                className="py-quiz-card"
                onClick={() => setSelected(String(index))}
              >
                <span className={`py-module-symbol ${module.color}`}>
                  {module.symbol}
                </span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div>
                  <span>
                    {saved?.submitted
                      ? `Сүүлийн оноо: ${correct}/3`
                      : "3 асуулт · ~3 минут"}
                  </span>
                  <ArrowRight size={17} />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    );

  return (
    <main id="main-content" className="py-main py-tests">
      <button
        className="py-text-button"
        onClick={() => {
          setSelected(null);
          setNotice("");
        }}
      >
        <ArrowLeft size={16} /> Бүх сорил
      </button>
      <div className="py-page-title">
        <div>
          <div className="py-eyebrow">
            {selected === "all" ? "НЭГДСЭН СОРИЛ" : "СЭДВИЙН СОРИЛ"}
          </div>
          <h1>
            {selected === "all"
              ? "Python мэдлэгийн сорил"
              : modules[Number(selected)].title}
          </h1>
        </div>
        <span className="py-pill">{group.length} асуулт</span>
      </div>
      {attempt.submitted && (
        <div className="py-score" role="status">
          <span className="py-score-number">
            {score}
            <small> / {group.length}</small>
          </span>
          <div>
            <h2>
              {score === group.length
                ? "Бүгд зөв. Сайн ажиллалаа!"
                : "Хариу бүрийн тайлбарыг уншаарай."}
            </h2>
            <p>Буруу хариулсан сэдвээ давтаад дахин оролдож болно.</p>
          </div>
          <button
            className="py-secondary"
            onClick={() =>
              updateProgress((current) => ({
                ...current,
                quizAttempts: {
                  ...current.quizAttempts,
                  [selected]: { answers: {}, submitted: false },
                },
              }))
            }
          >
            <RotateCcw size={16} /> Дахин сорих
          </button>
        </div>
      )}
      <div className="py-question-list">
        {group.map((question, index) => (
          <fieldset className="py-question" key={question.id}>
            <legend>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {question.prompt}
            </legend>
            {question.code && (
              <pre className="py-code-example">{question.code}</pre>
            )}
            <div className="py-choices">
              {question.choices.map((choice, option) => (
                <label
                  className={`${attempt.answers[question.id] === option ? "selected" : ""} ${attempt.submitted && option === question.answer ? "correct" : ""} ${attempt.submitted && attempt.answers[question.id] === option && option !== question.answer ? "incorrect" : ""}`}
                  key={choice}
                >
                  <input
                    type="radio"
                    name={question.id}
                    disabled={attempt.submitted}
                    checked={attempt.answers[question.id] === option}
                    onChange={() => change(question.id, option)}
                  />
                  <span>{choice}</span>
                  {attempt.submitted && option === question.answer && (
                    <Check size={17} />
                  )}
                  {attempt.submitted &&
                    attempt.answers[question.id] === option &&
                    option !== question.answer && <X size={17} />}
                </label>
              ))}
            </div>
            {attempt.submitted && (
              <div className="py-answer-explanation">
                <p>{question.explanation}</p>
                <button
                  type="button"
                  className="py-text-button"
                  disabled={false}
                  onClick={() => onReview(question.module)}
                >
                  <BookOpen size={14} /> Сэдэв давтах
                </button>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      {notice && (
        <p className="py-error" role="alert">
          {notice}
        </p>
      )}
      {!attempt.submitted && (
        <div className="py-quiz-footer">
          <span>
            {
              Object.keys(attempt.answers).filter((id) =>
                group.some((question) => question.id === id),
              ).length
            }{" "}
            / {group.length} хариулсан · Автоматаар хадгална
          </span>
          <button className="py-primary" onClick={submit}>
            <CheckCheck size={18} /> Хариугаа шалгах
          </button>
        </div>
      )}
    </main>
  );
}
