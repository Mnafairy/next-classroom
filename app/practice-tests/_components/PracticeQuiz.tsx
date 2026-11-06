"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  emptyQuiz,
  quizFeedback,
  restoreQuiz,
  selectQuestions,
  type PracticeQuestion,
  type QuizState,
} from "@/lib/curriculum/practice/quiz";
import { useSessionDraft } from "@/lib/curriculum/practice/use-session-draft";
import styles from "../../curriculum/curriculum.module.css";

export default function PracticeQuiz({
  grade,
  bank,
  initialLesson,
}: {
  grade: number;
  bank: PracticeQuestion[];
  initialLesson?: string;
}) {
  const [scope, setScope] = useState(
    initialLesson ? `lesson:${initialLesson}` : "all",
  );
  const restore = useCallback((raw: unknown) => restoreQuiz(raw, bank), [bank]);
  const [state, save, warning] = useSessionDraft<QuizState>(
    `kodlab:quiz:v1:${grade}:${initialLesson ?? "all"}`,
    emptyQuiz,
    restore,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const attempt = state.attempt;
  const feedback = attempt ? quizFeedback(attempt, bank) : null;
  const units = [...new Map(bank.map((q) => [q.unit, q.unitTitle])).entries()];
  const lessons = [
    ...new Map(bank.map((q) => [q.lessonId, q.lessonTitle])).entries(),
  ];
  const pool = scope.startsWith("lesson:")
    ? bank.filter((q) => q.lessonId === scope.slice(7))
    : scope.startsWith("unit:")
      ? bank.filter((q) => q.unit === Number(scope.slice(5)))
      : bank;
  const label =
    scope === "all"
      ? "Бүх нэгжийн холимог тест"
      : scope.startsWith("lesson:")
        ? (lessons.find(([id]) => id === scope.slice(7))?.[1] ?? "Сэдвийн тест")
        : (units.find(([id]) => id === Number(scope.slice(5)))?.[1] ??
          "Нэгжийн тест");
  const answered = feedback?.items.filter((item) => item.answered).length ?? 0;

  function start(questions = pool, title = label) {
    const items = selectQuestions(questions, 12, state.seen);
    if (!items.length) return;
    save({
      attempt: { items, answers: {}, submitted: false, label: title },
      seen: [...new Set([...state.seen, ...items.map((item) => item.id)])],
      rounds: state.rounds + 1,
    });
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  function answer(id: string, choice: number) {
    if (!attempt || attempt.submitted) return;
    save({
      ...state,
      attempt: { ...attempt, answers: { ...attempt.answers, [id]: choice } },
    });
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!attempt || !feedback?.complete || attempt.submitted) return;
    save({ ...state, attempt: { ...attempt, submitted: true } });
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  const resultText =
    feedback && attempt
      ? [
          `${grade}-р анги · ${attempt.label}`,
          attempt.submitted
            ? `${feedback.correct}/${feedback.total} · ${feedback.percent}%`
            : "Дуусаагүй давтлагын тест",
          ...feedback.items.map(
            ({ question, answer, answered, correct }, index) =>
              [
                `${index + 1}. ${question.prompt}`,
                question.code ?? "",
                `Миний хариу: ${answered ? question.choices[answer] : "Хариулаагүй"}`,
                ...(attempt.submitted
                  ? [
                      `${correct ? "Зөв" : "Дахин давтаарай"} · ${question.choices[0]}`,
                      question.explanation,
                    ]
                  : []),
              ]
                .filter(Boolean)
                .join("\n"),
          ),
        ].join("\n\n")
      : "";

  return (
    <section className={styles.quizArea}>
      <h2 ref={heading} tabIndex={-1} className={styles.quizHeading}>
        {attempt?.submitted
          ? `Үр дүн · ${feedback!.correct}/${feedback!.total} зөв`
          : attempt
            ? attempt.label
            : "Давтах сэдвээ сонго"}
      </h2>
      {attempt?.submitted && feedback && (
        <div className={styles.resultBox} aria-live="polite">
          <strong className={styles.score}>{feedback.percent}%</strong>
          <div>
            <p>
              {attempt.label} · Оролдлого {state.rounds}
            </p>
            <p>
              {feedback.reviewLessons.length
                ? "Алдсан сэдвээ давтаад дахин оролдоорой. Асуулт бүрийн доор тайлбар бий."
                : "Бүх хариу зөв. Ахисан дасгал эсвэл өөр хувилбараар үргэлжлүүлээрэй."}
            </p>
          </div>
        </div>
      )}
      {(!attempt || attempt.submitted) && (
        <div className={styles.quizSetup}>
          <label htmlFor="quiz-scope">Хамрах хүрээ</label>
          <select
            id="quiz-scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
          >
            <option value="all">Бүх нэгжийн холимог тест</option>
            <optgroup label="Нэгжээр давтах">
              {units.map(([id, title]) => (
                <option key={id} value={`unit:${id}`}>
                  {title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Хичээлээр давтах">
              {lessons.map(([id, title]) => (
                <option key={id} value={`lesson:${id}`}>
                  {title}
                </option>
              ))}
            </optgroup>
          </select>
          <p>
            {pool.length} асуултаас {Math.min(12, pool.length)}-ыг сонгоно.
            Холимог тест бүх нэгжийг хамарна. Дахин өгөхөд үзээгүй асуултыг
            түрүүлж сонгож, хариултын байрлалыг солино.
          </p>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => start()}
            >
              {attempt ? "Шинэ хувилбар эхлүүлэх" : "Тест эхлүүлэх"}
            </button>
            {feedback && feedback.reviewLessons.length > 0 && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  start(
                    bank.filter((q) =>
                      feedback.reviewLessons.includes(q.lessonId),
                    ),
                    "Алдсан сэдвийн давтлага",
                  )
                }
              >
                Алдсан сэдвээ дахин шалгах
              </button>
            )}
          </div>
        </div>
      )}
      <p className={styles.muted}>
        Хугацааны хязгааргүй. Хариулт, үр дүн энэ табд хадгалагдана. Багшийн
        үнэлгээнд тооцохгүй.
      </p>
      {warning && <p role="alert">{warning}</p>}
      {attempt?.submitted && feedback && (
        <section className={styles.reviewLinks}>
          <h3>
            {feedback.reviewLessons.length
              ? "Давтах хичээлүүд"
              : "Дараагийн сорилт"}
          </h3>
          <ul>
            {[
              ...new Map(
                feedback.items
                  .filter((item) =>
                    feedback.reviewLessons.length ? !item.correct : true,
                  )
                  .map(({ question }) => [question.lessonId, question]),
              ).values(),
            ].map((question) => (
              <li key={question.lessonId}>
                <Link
                  className={styles.textLink}
                  href={`${question.href}#extra-practice`}
                  prefetch={false}
                >
                  {question.lessonTitle} · 6 нэмэлт дасгал →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {attempt && feedback && (
        <form onSubmit={submit}>
          {!attempt.submitted && (
            <p className={styles.answerCount} role="status">
              {answered}/{attempt.items.length} асуултад хариулсан
            </p>
          )}
          <div className={styles.questions}>
            {attempt.items.map((item, index) => {
              const entry = feedback.items[index];
              const question = entry.question;
              return (
                <fieldset
                  className={styles.question}
                  key={item.id}
                  disabled={attempt.submitted}
                >
                  <legend>
                    {index + 1}. {question.prompt}
                  </legend>
                  <p className={styles.questionTopic}>{question.lessonTitle}</p>
                  {question.code && (
                    <pre tabIndex={0}>
                      <code>{question.code}</code>
                    </pre>
                  )}
                  <div className={styles.options}>
                    {item.order.map((choice) => (
                      <label
                        key={choice}
                        data-result={
                          attempt.submitted
                            ? choice === 0
                              ? "correct"
                              : entry.answer === choice
                                ? "incorrect"
                                : undefined
                            : undefined
                        }
                      >
                        <input
                          type="radio"
                          name={item.id}
                          value={choice}
                          checked={entry.answer === choice}
                          onChange={() => answer(item.id, choice)}
                        />
                        <span>{question.choices[choice]}</span>
                        {attempt.submitted && choice === 0 && (
                          <strong>Зөв хариу</strong>
                        )}
                        {attempt.submitted &&
                          choice !== 0 &&
                          entry.answer === choice && (
                            <strong>Таны хариу</strong>
                          )}
                      </label>
                    ))}
                  </div>
                  {attempt.submitted && (
                    <div className={styles.explanation}>
                      <p>
                        <strong>
                          {entry.correct ? "Зөв." : "Дахин анхаараарай."}
                        </strong>{" "}
                        {question.explanation}
                      </p>
                      <Link
                        className={styles.textLink}
                        href={question.href}
                        prefetch={false}
                      >
                        Хичээлээ давтах →
                      </Link>
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
          <div className={styles.actionRow}>
            {!attempt.submitted && (
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={!feedback.complete}
              >
                Хариултаа шалгах · {answered}/{feedback.total}
              </button>
            )}
            <a
              className={styles.textLink}
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(resultText.toWellFormed())}`}
              download={`grade-${grade}-practice-test.txt`}
            >
              {attempt.submitted ? "Үр дүнгээ татах" : "Хариултаа татах"}
            </a>
          </div>
          {!attempt.submitted && !feedback.complete && (
            <p className={styles.muted}>
              Бүх асуултад хариулсны дараа шалгах товч нээгдэнэ.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
