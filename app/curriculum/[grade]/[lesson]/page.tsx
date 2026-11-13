import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  coverageLabel,
  findGrade,
  gradeHref,
  gradePlans,
  lessonHref,
} from "@/lib/curriculum";
import FlowLab from "../../_components/FlowLab";
import { lessonFlowMode } from "@/lib/curriculum/flow";
import workspace from "../../workbench.module.css";
import PracticeRunner from "../../_components/PracticeRunner";
import PracticeLadder from "../../_components/PracticeLadder";
import {
  lessonPractice,
  practiceLanguage,
  practiceTestHref,
} from "@/lib/curriculum/practice";
import styles from "../../curriculum.module.css";

export function generateStaticParams() {
  return gradePlans.flatMap(({ grade, units }) =>
    units.flatMap(({ lessons }) =>
      lessons.map(({ id }) => ({ grade: String(grade), lesson: id })),
    ),
  );
}

type LessonPageProps = PageProps<"/curriculum/[grade]/[lesson]">;

async function readLesson(params: LessonPageProps["params"]) {
  const { grade, lesson } = await params;
  const plan = findGrade(grade);
  if (!plan) notFound();

  const sequence = plan.units.flatMap((unit) =>
    unit.lessons.map((entry) => ({ entry, unit: unit.title })),
  );
  const index = sequence.findIndex(({ entry }) => entry.id === lesson);
  const current = sequence[index];
  if (!current) notFound();

  return { plan, ...current, index, sequence };
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { plan, entry } = await readLesson(params);
  return {
    title: `${entry.title} · ${plan.grade}-р анги · КодЛаб`,
    description:
      entry.coverage === "existing" ? entry.existing.summary : entry.objective,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { plan, entry, index, sequence, unit } = await readLesson(params);
  const previous = sequence[index - 1]?.entry;
  const next = sequence[index + 1]?.entry;

  const flowMode = lessonFlowMode(entry.id);
  return (
    <div className={workspace.lessonLayout}>
      <aside className={workspace.lessonSidebar}>
        <Link href={gradeHref(plan.grade)} className={styles.back}>
          ← {plan.grade}-р анги
        </Link>
        <p className={workspace.eyebrow}>ХИЧЭЭЛҮҮД</p>
        <nav aria-label="Ангийн хичээлүүд">
          {sequence.map(({ entry: item }, i) => (
            <Link
              key={item.id}
              href={lessonHref(plan.grade, item.id)}
              aria-current={item.id === entry.id ? "page" : undefined}
              prefetch={false}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={workspace.lessonContent}>
        <Link
          href={gradeHref(plan.grade)}
          className={styles.back}
          prefetch={false}
        >
          <ArrowLeft size={17} aria-hidden="true" /> {plan.grade}-р ангийн
          хичээлүүд
        </Link>
        <article>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              {unit} · {index + 1}/{sequence.length} · {entry.periods} цаг
            </p>
            <h1>{entry.title}</h1>
            {entry.coverage !== "existing" && <p>{entry.objective}</p>}
            <div className={styles.actionRow}>
              <a className={styles.textLink} href="#extra-practice">
                6 нэмэлт дасгал ↓
              </a>
              <Link
                className={styles.textLink}
                href={practiceTestHref(plan.grade, entry.id)}
                prefetch={false}
              >
                Сэдвийн давтлагын тест →
              </Link>
            </div>
          </header>

          <nav className={workspace.stepsNav} aria-label="Хичээлийн алхмууд">
            <a href="#lesson-example">
              <b>01</b> Ойлгох
            </a>
            <a href="#extra-practice">
              <b>02</b> Дасгал хийх
            </a>
            <Link href={practiceTestHref(plan.grade, entry.id)}>
              <b>03</b> Өөрийгөө шалгах
            </Link>
          </nav>
          {flowMode && (
            <FlowLab
              key={entry.id}
              initialMode={flowMode}
              language={plan.grade === 10 ? "python" : "javascript"}
            />
          )}
          <div id="lesson-example" />
          {entry.coverage !== "new" && (
            <section className={styles.block}>
              <h2>Код бичиж турших</h2>
              <p>{entry.existing.summary}</p>
              <ul className={`${styles.criteria} ${styles.practiceLinks}`}>
                {entry.existing.links.map(({ href, label }) => (
                  <li key={href}>
                    <a href={href}>{label} →</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {entry.coverage !== "existing" && (
            <>
              <p className={styles.materials}>
                <strong>Бэлтгэх зүйл</strong> {entry.materials}
              </p>

              <section className={styles.block}>
                <h2>Жишээгээр ойлгоё</h2>
                <p>{entry.example.explanation}</p>
                {entry.example.files?.map((file) =>
                  file.mode === "javascript" || file.mode === "python" ? (
                    <PracticeRunner
                      key={`${entry.id}/${file.name}`}
                      file={file}
                    />
                  ) : (
                    <figure key={file.name} className={styles.example}>
                      <figcaption>
                        {file.name}
                        {file.mode === "download" && (
                          <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(file.contents)}`}
                            download={file.name.split("/").at(-1)}
                          >
                            Файл татах
                          </a>
                        )}
                      </figcaption>
                      <pre tabIndex={0}>
                        <code>{file.contents}</code>
                      </pre>
                    </figure>
                  ),
                )}
              </section>

              <section className={styles.block}>
                <h2>Өөрөө туршаарай</h2>
                <ol className={styles.steps}>
                  {entry.practice.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className={styles.block}>
                <h2>Хийж дуусгах бүтээл</h2>
                <p>{entry.deliverable}</p>
                <ul className={styles.criteria} aria-label="Үнэлгээний шалгуур">
                  {entry.criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              </section>

              <section className={`${styles.block} ${styles.check}`}>
                <h2>Өөрийгөө шалгаарай</h2>
                <p>{entry.check.question}</p>
                <details>
                  <summary>Хариу харах</summary>
                  <p>{entry.check.answer}</p>
                </details>
              </section>
            </>
          )}

          <PracticeLadder
            key={`${plan.grade}/${entry.id}`}
            grade={plan.grade}
            lesson={entry.id}
            pack={lessonPractice(plan.grade, entry.id)}
            language={practiceLanguage(plan.grade, entry.id)}
            testHref={practiceTestHref(plan.grade, entry.id)}
            nextHref={next ? lessonHref(plan.grade, next.id) : undefined}
          />
          <p className={styles.source}>
            {coverageLabel[entry.coverage]} · Эх төлөвлөгөөний «{plan.grade}»
            хуудас · {entry.sourceRow}-р мөр
          </p>
        </article>
        <nav
          className={styles.neighbors}
          aria-label="Өмнөх болон дараагийн хичээл"
        >
          {previous && (
            <Link href={lessonHref(plan.grade, previous.id)} prefetch={false}>
              <span>
                <ArrowLeft size={16} aria-hidden="true" /> Өмнөх хичээл
              </span>
              <strong>{previous.title}</strong>
            </Link>
          )}
          {next && (
            <Link
              href={lessonHref(plan.grade, next.id)}
              className={styles.next}
              prefetch={false}
            >
              <span>
                Дараагийн хичээл <ArrowRight size={16} aria-hidden="true" />
              </span>
              <strong>{next.title}</strong>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
