import Link from "next/link";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { gradeHref, gradePlans } from "@/lib/curriculum";
import styles from "./page.module.css";

type CardPreview = {
  theme: "python" | "javascript" | "next";
  topics: readonly string[];
  file: string;
  code: string;
};

export type LessonCardData = CardPreview & {
  name: string;
  mark: string;
  grade: string;
  count: string;
  description: string;
  outcome: string;
  href: string;
  documentLink?: boolean;
};

export function LessonCard({
  card,
  heading: Heading = "h3",
}: {
  card: LessonCardData;
  heading?: "h2" | "h3";
}) {
  const content = (
    <>
      <div className={styles.cardTop}>
        <span className={styles.lessonMark} aria-hidden="true">
          {card.mark}
        </span>
        <span className={styles.grade}>{card.grade}</span>
      </div>
      <div className={styles.cardTitle}>
        <Heading>{card.name}</Heading>
        <span>{card.count}</span>
      </div>
      <p className={styles.description}>{card.description}</p>
      <div className={styles.topics}>
        {card.topics.map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>
      <div className={styles.code} aria-hidden="true">
        <div>
          <Code2 size={13} />
          <span>{card.file}</span>
          <span className={styles.codeDot} />
        </div>
        <pre>{card.code}</pre>
      </div>
      <p className={styles.outcome}>
        <Sparkles size={15} aria-hidden="true" />
        {card.outcome}
      </p>
      <span className={styles.enter}>
        Хичээлд орох <ArrowRight size={18} aria-hidden="true" />
      </span>
    </>
  );
  const props = {
    href: card.href,
    className: `${styles.card} ${styles[card.theme]}`,
    "aria-label": `${card.name} · Хичээлд орох`,
  };
  return card.documentLink ? (
    <a {...props}>{content}</a>
  ) : (
    <Link {...props} prefetch={false}>
      {content}
    </Link>
  );
}

const gradePreviews: Record<number, CardPreview> = {
  7: {
    theme: "javascript",
    topics: ["Давталт", "Объект", "Интерактив веб"],
    file: "for-loops.js",
    code: "for (let n of [1, 2]) {\n  console.log(n * 7);\n}",
  },
  8: {
    theme: "javascript",
    topics: ["Функц", "Массив", "Өгөгдөл хадгалах"],
    file: "cost.js",
    code: "function total(p, n) {\n  return p * n;\n}",
  },
  10: {
    theme: "python",
    topics: ["Python", "Жагсаалт", "Файл"],
    file: "scores.py",
    code: "scores = [85, 90, 95]\nprint(max(scores))",
  },
  11: {
    theme: "next",
    topics: ["Next.js", "Судалгааны веб", "Багийн төсөл"],
    file: "app/page.tsx",
    code: "export default () => (\n  <h1>Клубийн нүүр</h1>\n);",
  },
};

export function GradeCards({ heading = "h3" }: { heading?: "h2" | "h3" }) {
  return (
    <nav className={styles.gradeCards} aria-label="Анги тус бүрийн хичээл">
      {gradePlans.map((plan) => (
        <LessonCard
          key={plan.grade}
          heading={heading}
          card={{
            ...gradePreviews[plan.grade],
            name: `${plan.grade}-р анги`,
            mark: String(plan.grade),
            grade: "Мэдээллийн технологи",
            count: `${plan.units.reduce((total, unit) => total + unit.lessons.length, 0)} хичээл`,
            description: plan.summary,
            outcome: "Хичээл бүрд 6 нэмэлт дасгал, ахисан сорилт бий.",
            href: gradeHref(plan.grade),
          }}
        />
      ))}
    </nav>
  );
}
