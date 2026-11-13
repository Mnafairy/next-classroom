import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { findGrade, gradePlans, lessonHref } from "@/lib/curriculum";
import LessonExplorer from "../_components/LessonExplorer";
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

  const firstLesson = plan.units[0]?.lessons[0];
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
          {firstLesson && (
            <Link
              className={styles.primaryButton}
              href={lessonHref(plan.grade, firstLesson.id)}
              prefetch={false}
            >
              Эхний хичээлийг эхлэх →
            </Link>
          )}
          <Link
            className={styles.textLink}
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
      <LessonExplorer
        plan={{
          grade: plan.grade,
          units: plan.units.map((unit) => ({
            title: unit.title,
            lessons: unit.lessons.map(({ id, title, periods }) => ({
              id,
              title,
              periods,
            })),
          })),
        }}
      />
      <div>
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
