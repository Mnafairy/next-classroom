import Link from "next/link";
import { notFound } from "next/navigation";
import { findGrade } from "@/lib/curriculum";
import { practiceQuestions } from "@/lib/curriculum/practice";
import PracticeQuiz from "../_components/PracticeQuiz";
import styles from "../../curriculum/curriculum.module.css";

type Props = PageProps<"/practice-tests/[grade]">;
export async function generateMetadata({ params }: Props) {
  const { grade } = await params;
  const plan = findGrade(grade);
  if (!plan) notFound();
  return { title: `${plan.grade}-р анги · Давтлагын тест · КодЛаб` };
}

export default async function GradeTestPage({ params, searchParams }: Props) {
  const { grade } = await params;
  const plan = findGrade(grade);
  if (!plan) notFound();
  const { lesson } = await searchParams;
  const bank = practiceQuestions(plan.grade);
  const initialLesson =
    typeof lesson === "string" && bank.some((q) => q.lessonId === lesson)
      ? lesson
      : undefined;
  return (
    <div className={styles.reading}>
      <Link className={styles.back} href="/practice-tests" prefetch={false}>
        ← Тестийн ангиуд
      </Link>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          {plan.grade}-р анги · {bank.length} асуултын сан
        </p>
        <h1>Мэдлэгээ бататгаарай</h1>
        <p>
          Өөрийн хурдаар хариул. Шалгасны дараа зөв хариу, тайлбар болон давтах
          хичээлээ харна.
        </p>
      </header>
      <PracticeQuiz
        key={`${grade}/${initialLesson ?? "all"}`}
        grade={plan.grade}
        bank={bank}
        initialLesson={initialLesson}
      />
    </div>
  );
}
