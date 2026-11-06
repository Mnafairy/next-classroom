import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gradePlans } from "@/lib/curriculum";
import { practiceQuestions, practiceTestHref } from "@/lib/curriculum/practice";
import { EXAM_GRADE_LABEL, EXAM_MINUTES } from "@/lib/exam/content";
import styles from "../curriculum/curriculum.module.css";

export const metadata: Metadata = {
  title: "Давтлагын тест · КодЛаб",
  description:
    "7, 8, 10, 11-р ангийн хичээл бүрийн тайлбартай, дахин өгөх боломжтой давтлагын тест.",
};

export default function PracticeTestsPage() {
  return (
    <>
      <Link className={styles.back} href="/curriculum" prefetch={false}>
        ← Хичээлүүд
      </Link>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Давтаж сурах орон зай</p>
        <h1>Давтлагын тест</h1>
        <p>
          Анги, нэгж эсвэл сэдвээ сонго. Хариултаа шалгаад тайлбарыг уншиж,
          хэрэгтэй сэдвээ дахин давтаарай.
        </p>
      </header>
      <p className={styles.testIntro}>
        Хугацааны хязгааргүй · Хэдэн ч удаа өгч болно · Багшийн үнэлгээнд
        тооцохгүй
      </p>
      <ul className={styles.grades} aria-label="Тестийн ангиуд">
        {gradePlans.map((plan) => (
          <li key={plan.grade}>
            <Link
              className={styles.gradeCard}
              href={practiceTestHref(plan.grade)}
              prefetch={false}
            >
              <span className={styles.gradeNumber} aria-hidden="true">
                {plan.grade}
              </span>
              <div>
                <h2>{plan.grade}-р анги</h2>
                <p>{plan.summary}</p>
                <p>
                  {practiceQuestions(plan.grade).length} асуултын сан · Нэг
                  удаад 12 хүртэл
                </p>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <section className={styles.note}>
        <h2>Багшийн кодтой шалгалт</h2>
        <p>
          {EXAM_GRADE_LABEL} · JavaScript суурь · {EXAM_MINUTES} минут. Багш код
          өгсөн үед энэ шалгалтад орно.
        </p>
        <Link href="/exam" prefetch={false}>
          Кодтой шалгалтад орох →
        </Link>
      </section>
    </>
  );
}
