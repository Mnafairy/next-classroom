import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  coverageLabel,
  findGrade,
  gradePlans,
  lessonHref,
} from "@/lib/curriculum";
import styles from "../curriculum.module.css";
import { practiceTestHref } from "@/lib/curriculum/practice";

export function generateStaticParams() {
  return gradePlans.map(({ grade }) => ({ grade: String(grade) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/curriculum/[grade]">) {
  const { grade } = await params;
  const plan = findGrade(grade);
  if (!plan) notFound();
  return {
    title: `${plan.grade}-р анги · Мэдээллийн технологи · КодЛаб`,
    description: plan.summary,
  };
}

export default async function GradePage({
  params,
}: PageProps<"/curriculum/[grade]">) {
  const { grade } = await params;
  const plan = findGrade(grade);
  if (!plan) notFound();

  let order = 0;

  return (
    <>
      <Link href="/curriculum" className={styles.back} prefetch={false}>
        <ArrowLeft size={17} aria-hidden="true" /> Бүх анги
      </Link>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Мэдээллийн технологи</p>
        <h1>{plan.grade}-р анги</h1>
        <p>{plan.summary}</p>
        <div className={styles.actionRow}>
          <Link
            className={styles.primaryButton}
            href={practiceTestHref(plan.grade)}
            prefetch={false}
          >
            Давтлагын тест →
          </Link>
          <span className={styles.muted}>
            Хичээл бүрд 6 нэмэлт дасгал · 3 түвшин
          </span>
        </div>
      </div>
      <div className={styles.sequence}>
        {plan.units.map((unit) => (
          <section key={unit.title}>
            <h2>{unit.title}</h2>
            <ul className={styles.lessonList}>
              {unit.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={lessonHref(plan.grade, lesson.id)}
                    prefetch={false}
                  >
                    <span className={styles.ordinal} aria-hidden="true">
                      {String(++order).padStart(2, "0")}
                    </span>
                    <span className={styles.lessonLabel}>
                      <strong>{lesson.title}</strong>
                      <span>
                        {lesson.periods} цаг · {coverageLabel[lesson.coverage]}{" "}
                        · 6 нэмэлт дасгал
                      </span>
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {plan.pacing && (
          <details className={styles.note}>
            <summary>Багшид зориулсан цагийн тэмдэглэл</summary>
            <p>{plan.pacing}</p>
          </details>
        )}
      </div>
    </>
  );
}
