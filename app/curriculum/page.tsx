import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gradePlans, gradeHref } from "@/lib/curriculum";
import styles from "./curriculum.module.css";

export const metadata: Metadata = {
  title: "Мэдээллийн технологийн хичээл · КодЛаб",
  description:
    "Оюунлаг сургуулийн 7, 8, 10, 11-р ангийн мэдээллийн технологийн хичээл, дадлага, төсөл.",
};

export default function CurriculumPage() {
  return (
    <>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Мэдээллийн технологи</p>
        <h1>Ангиа сонгоорой</h1>
        <p>
          Жишээг үзэж, өөрийн бүтээлээ хийгээрэй. Түрүүлж дуусвал хичээл бүрийн
          6 нэмэлт дасгал, ахисан сорилтоор үргэлжлүүл.
        </p>
        <Link
          className={styles.textLink}
          href="/practice-tests"
          prefetch={false}
        >
          Тайлбартай давтлагын тест →
        </Link>
      </div>
      <ul className={styles.grades} aria-label="Ангиуд">
        {gradePlans.map((plan) => (
          <li key={plan.grade}>
            <Link
              href={gradeHref(plan.grade)}
              className={styles.gradeCard}
              prefetch={false}
            >
              <span className={styles.gradeNumber} aria-hidden="true">
                {plan.grade}
              </span>
              <div>
                <h2>{plan.grade}-р анги</h2>
                <p>{plan.summary}</p>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <details className={styles.note}>
        <summary>Жилийн хөтөлбөрийн хамрах хүрээ</summary>
        <p>
          Дараалал, цагийг Оюунлаг сургуулийн 2026–2027 оны жилийн төлөвлөгөөний
          7, 8, 10, 11-р ангийн хуудаснаас авсан.
        </p>
        <p>
          Бэлэн дадлага нь өмнөх КодЛаб хичээл рүү хөтөлнө. Нэмэлт хичээл нь
          өмнөх дадлагыг үргэлжлүүлж, дутуу байсан агуулгыг заана. Шинэ хичээлд
          жишээ, өөрөө хийх даалгавар, үнэлэх шалгуур бий.
        </p>
      </details>
    </>
  );
}
