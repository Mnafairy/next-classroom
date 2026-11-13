"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, BookOpen } from "lucide-react";
import type { Lesson } from "@/lib/curriculum/types";
import { lessonHref } from "@/lib/curriculum";
import styles from "../workbench.module.css";

export default function LessonExplorer({
  plan,
}: {
  plan: {
    grade: number;
    units: {
      title: string;
      lessons: Pick<Lesson, "id" | "title" | "periods">[];
    }[];
  };
}) {
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("");
  const lessons = plan.units.flatMap((group) =>
    group.lessons.map((lesson) => ({ ...lesson, unit: group.title })),
  );
  const filtered = lessons.filter(
    (lesson) =>
      (!unit || lesson.unit === unit) &&
      `${lesson.title} ${lesson.unit}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <div className={styles.explorer}>
      <aside className={styles.unitNav}>
        <span className={styles.eyebrow}>ХИЧЭЭЛИЙН БҮЛЭГ</span>
        <button aria-pressed={!unit} onClick={() => setUnit("")}>
          Бүх хичээл <span>{lessons.length}</span>
        </button>
        {plan.units.map((group) => (
          <button
            key={group.title}
            aria-pressed={unit === group.title}
            onClick={() => setUnit(group.title)}
          >
            {group.title}
            <span>{group.lessons.length}</span>
          </button>
        ))}
        <p>
          01 Жишээг ойлго
          <br />
          02 Өөрөө турш
          <br />
          03 Мэдлэгээ шалга
        </p>
      </aside>
      <div className={styles.lessonResults}>
        <label className={styles.search}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Хичээлийн нэрээр хайх…"
            aria-label="Хичээл хайх"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className={styles.resultHeading}>
          <h2>{unit || "Сурах зам"}</h2>
          <span role="status">{filtered.length} хичээл</span>
        </div>
        {filtered.length ? (
          filtered.map((lesson) => (
            <Link
              className={styles.lessonRow}
              key={lesson.id}
              href={lessonHref(plan.grade, lesson.id)}
              prefetch={false}
            >
              <span className={styles.lessonNumber}>
                {String(
                  lessons.findIndex((item) => item.id === lesson.id) + 1,
                ).padStart(2, "0")}
              </span>
              <div>
                <small>{lesson.unit}</small>
                <h3>{lesson.title}</h3>
                <p>{lesson.periods} цаг · 6 дасгал · Өөрийгөө шалгах</p>
              </div>
              <ArrowRight size={20} />
            </Link>
          ))
        ) : (
          <div className={styles.empty}>
            <BookOpen size={28} />
            <h3>Хичээл олдсонгүй</h3>
            <p>Өөр үгээр хайх эсвэл бүлгийн шүүлтүүрээ цэвэрлээрэй.</p>
            <button
              onClick={() => {
                setSearch("");
                setUnit("");
              }}
            >
              Бүх хичээлийг харах
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
