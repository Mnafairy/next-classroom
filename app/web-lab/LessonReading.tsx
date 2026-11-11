"use client";

import { ArrowRight, BookOpen, Clock, Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { cardDocument } from "@/lib/web-lab/document";
import {
  exercises,
  lessons,
  type ExerciseId,
  type LessonId,
} from "@/lib/web-lab/lessons";
import styles from "./web-lab.module.css";

export default function LessonReading({
  topic,
  sampleImage,
  onPractice,
}: {
  topic: LessonId;
  sampleImage: string;
  onPractice: (id: ExerciseId) => void;
}) {
  const lesson = lessons.find(({ id }) => id === topic) ?? lessons[0];
  const practice = exercises.filter((exercise) => exercise.topic === lesson.id);
  const example = practice[practice.length - 1].solution;
  const preview = useMemo(
    () => cardDocument(example, sampleImage, document).html,
    [example, sampleImage],
  );
  return (
    <>
      <div className={styles.workspaceHeading}>
        <div>
          <p className={styles.breadcrumb}>
            Хичээлүүд / {lessons.findIndex(({ id }) => id === lesson.id) + 1}
          </p>
          <h1>{lesson.title}</h1>
        </div>
        <span className={styles.time}>
          <Clock size={15} aria-hidden="true" /> 40 минут
        </span>
      </div>
      <div className={styles.reading}>
        <section className={styles.lessonIntro}>
          <div>
            <h2>
              <BookOpen size={20} aria-hidden="true" /> Юу сурах вэ?
            </h2>
            <p className={styles.goal}>{lesson.goal}</p>
            <p>{lesson.explanation}</p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => onPractice(practice[0].id)}
            >
              Дасгал хийж эхлэх <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <figure className={styles.lessonPreview}>
            <figcaption>Энэ хичээлээр хийх бүтээл</figcaption>
            <iframe title="Хичээлийн жишээ карт" sandbox="" srcDoc={preview} />
          </figure>
        </section>
        <section
          className={styles.lessonSection}
          aria-labelledby="concept-heading"
        >
          <h2 id="concept-heading">Жишээгээр ойлгоё</h2>
          <div className={styles.concepts}>
            {lesson.concepts.map(({ code, text }) => (
              <div key={code} className={styles.concept}>
                <pre tabIndex={0}>
                  <code>{code}</code>
                </pre>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.lessonSection}>
          <h2>Түгээмэл алдааг засъя</h2>
          <ul className={styles.mistakes}>
            {lesson.mistakes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
        <section className={styles.lessonSection}>
          <h2>
            <Lightbulb size={20} aria-hidden="true" /> Өөрөө туршаарай
          </h2>
          <p>{lesson.practice}</p>
          <details className={styles.review}>
            <summary>{lesson.question}</summary>
            <p>{lesson.answer}</p>
          </details>
          <button
            type="button"
            className={styles.primary}
            onClick={() => onPractice(practice[0].id)}
          >
            {practice.length} дасгалаар бататгах{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      </div>
    </>
  );
}
