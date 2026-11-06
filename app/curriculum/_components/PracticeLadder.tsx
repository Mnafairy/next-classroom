"use client";

import Link from "next/link";
import { useRef } from "react";
import type { PracticePack } from "@/lib/curriculum/practice/types";
import {
  emptyExercises,
  extensionPrompts,
  restoreExercises,
} from "@/lib/curriculum/practice/drafts";
import { useSessionDraft } from "@/lib/curriculum/practice/use-session-draft";
import PracticeRunner from "./PracticeRunner";
import styles from "../curriculum.module.css";

const levels = [
  { title: "Бататгах", description: "Богино бодлогоор сууриа шалга." },
  { title: "Хэрэглэх", description: "Шинэ нөхцөлд өөрөө шийд." },
  { title: "Ахисан сорилт", description: "Хэд хэдэн чадварыг холбож бүтээ." },
];

export default function PracticeLadder({
  grade,
  lesson,
  pack,
  language,
  testHref,
  nextHref,
}: {
  grade: number;
  lesson: string;
  pack: PracticePack;
  language: "javascript" | "python" | "local";
  testHref: string;
  nextHref?: string;
}) {
  const draftKey = `kodlab:extra:v1:${grade}:${lesson}`;
  const [draft, save, warning] = useSessionDraft(
    draftKey,
    emptyExercises,
    restoreExercises,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = draft.selected;
  const completed = new Set(draft.completed);
  const done = completed.has(selected);
  const level = levels[Math.floor(selected / 2)];
  const extensionTask =
    Math.floor(draft.extension / extensionPrompts.length) % pack.tasks.length;
  const extensionPrompt =
    extensionPrompts[draft.extension % extensionPrompts.length];
  const notes = draft.notes[selected] ?? "";

  function select(index: number) {
    save({ ...draft, selected: index });
    heading.current?.focus();
  }
  function complete() {
    const next = new Set(completed);
    if (done) next.delete(selected);
    else next.add(selected);
    save({ ...draft, completed: [...next] });
  }
  const nextUnfinished = pack.tasks.findIndex(
    (_, index) => !completed.has(index) && index !== selected,
  );
  const download = [
    `${grade}-р анги · ${lesson}`,
    ...pack.tasks.map(
      (task, index) =>
        `${completed.has(index) ? "[x]" : "[ ]"} ${index + 1}. ${task}\n${draft.notes[index] ?? ""}`,
    ),
  ].join("\n\n");

  return (
    <section
      id="extra-practice"
      className={`${styles.block} ${styles.practiceArea}`}
      aria-labelledby="extra-heading"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Түрүүлж дууссан уу?</p>
          <h2 id="extra-heading">Дараагийн сорилтоо сонгоорой</h2>
        </div>
        <span className={styles.progressBadge} role="status">
          {completed.size}/6 дууссан
        </span>
      </div>
      <p>
        Дарааллаар нь хийх эсвэл өөрт тохирох түвшнээ сонго. Үр дүнгээ
        даалгаврын шалгууртай тулгаад дууссан гэж тэмдэглээрэй.
      </p>
      <div className={styles.levelGrid}>
        {levels.map((entry, levelIndex) => (
          <div key={entry.title}>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <div className={styles.taskButtons}>
              {[levelIndex * 2, levelIndex * 2 + 1].map((index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={index === selected}
                  onClick={() => select(index)}
                >
                  {completed.has(index) ? "✓ " : ""}Дасгал {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.taskCard}>
        <h3 ref={heading} tabIndex={-1}>
          Дасгал {selected + 1} · {level.title}
        </h3>
        <p className={styles.taskPrompt}>{pack.tasks[selected]}</p>
        <details className={styles.hint} key={`hint-${selected}`}>
          <summary>Чиглүүлэх санаа</summary>
          <p>{pack.hint}</p>
        </details>
        {language !== "local" ? (
          <PracticeRunner
            key={`${lesson}/${selected}`}
            draftKey={`${draftKey}:code:${selected}`}
            file={
              language === "python"
                ? {
                    mode: "python",
                    name: `practice-${selected + 1}.py`,
                    contents: "# Шийдлээ энд бичээрэй\n",
                  }
                : {
                    mode: "javascript",
                    name: `practice-${selected + 1}.js`,
                    contents: "// Шийдлээ энд бичээрэй\n",
                  }
            }
          />
        ) : (
          <p className={styles.muted}>
            Хичээлийн жишээ файлыг татаж эсвэл өөрийн төсөл дээр ажиллаад үр
            дүнгээ доор тэмдэглээрэй.
          </p>
        )}
        <label className={styles.answerNotes}>
          Шийдэл, шалгасан үр дүн, бүтээлийн тэмдэглэл
          <textarea
            value={notes}
            rows={4}
            maxLength={12000}
            onChange={(event) =>
              save({
                ...draft,
                notes: { ...draft.notes, [selected]: event.target.value },
              })
            }
            placeholder="Оролт → хүлээх үр дүн → бодит үр дүн. Юу сурсан бэ?"
          />
        </label>
        <div className={styles.actionRow}>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={complete}
          >
            {done ? "Дууссан тэмдэглэгээг буцаах" : "Шалгаад дуусгасан"}
          </button>
          {nextUnfinished >= 0 && (
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => select(nextUnfinished)}
            >
              Дараагийн дасгал →
            </button>
          )}
        </div>
        <p className={styles.muted}>
          Код, тэмдэглэл, дууссан төлөв энэ табд хадгалагдана. Багшийн үнэлгээнд
          тооцохгүй. Ажлаа удаан хадгалах бол татаж аваарай.
        </p>
        {warning && <p role="alert">{warning}</p>}
        <a
          className={styles.textLink}
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(download.toWellFormed())}`}
          download={`grade-${grade}-${lesson}-practice.txt`}
        >
          Тэмдэглэлээ татах
        </a>
      </div>
      <details
        className={styles.extension}
        open={completed.size === 6 || undefined}
      >
        <summary>Бүгдийг хийсэн бол · Бүтээлээ өргөжүүлээрэй</summary>
        <p>
          <strong>Дасгал {extensionTask + 1}-ийг үргэлжлүүл.</strong>{" "}
          {pack.tasks[extensionTask]}
        </p>
        <p>{extensionPrompt}</p>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() =>
            save({ ...draft, extension: (draft.extension + 1) % 1000000 })
          }
        >
          Өөр хувилбар
        </button>
      </details>
      <div className={styles.actionRow}>
        <Link className={styles.textLink} href={testHref} prefetch={false}>
          Энэ сэдвийн давтлагын тест →
        </Link>
        {nextHref && (
          <Link
            className={styles.textLink}
            href={`${nextHref}#extra-practice`}
            prefetch={false}
          >
            Дараагийн сэдвийн сорилт →
          </Link>
        )}
      </div>
    </section>
  );
}
