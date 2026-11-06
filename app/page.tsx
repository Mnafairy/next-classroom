import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Cloud,
  Code2,
  Monitor,
  Sparkles,
} from "lucide-react";
import LegacyPythonLink from "@/components/LegacyPythonLink";
import { exercises as pythonExercises } from "@/lib/python/course";
import { exercises as nextExercises } from "@/lib/course/lessons";
import styles from "./page.module.css";

const lessons = [
  {
    name: "Python",
    mark: "Py",
    grade: "9, 10-р анги",
    count: `${pythonExercises.length} дасгал`,
    description: "Бодлого бодож, алгоритмаа код болгоорой.",
    topics: ["Хувьсагч", "Нөхцөл", "Давталт"],
    code: 'for i in range(3):\n    print("Би чадна!")',
    file: "hello.py",
    outcome: "Бодлогын хариугаа шууд ажиллуулж шалгана.",
    href: "/python",
    theme: styles.python,
  },
  {
    name: "JavaScript",
    mark: "JS",
    grade: "6, 7, 8-р анги",
    count: "24 дасгал",
    description: "Эхний кодоо бичиж, логик сэтгэлгээгээ хөгжүүлээрэй.",
    topics: ["Хувьсагч", "Хэвлэх", "if / else"],
    code: 'let name = "Билгүүн";\nconsole.log("Сайн уу, " + name);',
    file: "hello.js",
    outcome: "Кодын үр дүнг харж, мэдлэгээ сорилоор бататгана.",
    href: "/kodlab/index.html",
    theme: styles.javascript,
  },
  {
    name: "Next.js",
    mark: "N",
    grade: "Веб хөгжүүлэлт",
    count: `${nextExercises.length} хичээл`,
    description: "Компонентуудаа нэгтгээд өөрийн вебийг бүтээгээрэй.",
    topics: ["Components", "Props", "State"],
    code: "export default function Hello() {\n  return <h1>Hello, world!</h1>;\n}",
    file: "page.tsx",
    outcome: "Кодоо өөрчлөөд веб хэрхэн ажиллахыг харна.",
    href: "/next-classroom",
    theme: styles.next,
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <LegacyPythonLink />
      <header className={styles.header}>
        <span className="classroom-wordmark">
          <span className="classroom-logo">
            <Code2 size={23} aria-hidden="true" />
          </span>
          <span>
            Oyunlag <span>code</span>
          </span>
        </span>
        <span className={styles.headerNote}>
          <Monitor size={16} aria-hidden="true" /> Таны код бичих орон зай
        </span>
      </header>
      <main id="main-content" className={styles.main}>
        <section className={styles.intro} aria-labelledby="home-heading">
          <div>
            <p className={styles.eyebrow}>
              <span /> КОД БИЧИЖ СУРЦГААЯ
            </p>
            <h1 id="home-heading">
              Жижиг алхам бүр
              <br />
              том санааны эхлэл.
            </h1>
            <p className={styles.introText}>
              Хичээлээ сонго. Кодоо бич. Үр дүнгээ хар.
              <br />
              Багшийнхаа өгсөн хичээлээс эхлээрэй.
            </p>
          </div>
          <aside className={styles.saveNote}>
            <span className={styles.saveIcon}>
              <Cloud size={25} aria-hidden="true" />
            </span>
            <h2>Таны ахиц тантай хамт.</h2>
            <p>
              Сурагчийн ID-гаар нэвтрээд, эхэлсэн ажлаа өөр компьютер дээр ч
              үргэлжлүүлээрэй.
            </p>
            <span>
              <Check size={15} aria-hidden="true" /> Код болон ахиц хадгалагдана
            </span>
          </aside>
        </section>
        <Link
          href="/curriculum"
          className={styles.curriculumLink}
          prefetch={false}
        >
          <BookOpen size={23} aria-hidden="true" />
          <span>
            <strong>Анги тус бүрийн хичээл</strong>
            <span>7, 8, 10, 11-р анги · Мэдээллийн технологи</span>
          </span>
          <ArrowRight size={19} aria-hidden="true" />
        </Link>
        <div className={styles.sectionHeading}>
          <h2>Хичээлээ сонгоорой</h2>
          <span>3 чиглэл · Өөрийн хурдаар</span>
        </div>
        <nav className={styles.lessons} aria-label="Хичээл сонгох">
          {lessons.map((lesson) => {
            const content = (
              <>
                <div className={styles.cardTop}>
                  <span className={styles.lessonMark} aria-hidden="true">
                    {lesson.mark}
                  </span>
                  <span className={styles.grade}>{lesson.grade}</span>
                </div>
                <div className={styles.cardTitle}>
                  <h2>{lesson.name}</h2>
                  <span>{lesson.count}</span>
                </div>
                <p className={styles.description}>{lesson.description}</p>
                <div className={styles.topics}>
                  {lesson.topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
                <div className={styles.code} aria-hidden="true">
                  <div>
                    <Code2 size={13} />
                    <span>{lesson.file}</span>
                    <span className={styles.codeDot} />
                  </div>
                  <pre>{lesson.code}</pre>
                </div>
                <p className={styles.outcome}>
                  <Sparkles size={15} aria-hidden="true" />
                  {lesson.outcome}
                </p>
                <span className={styles.enter}>
                  Хичээлд орох <ArrowRight size={18} aria-hidden="true" />
                </span>
              </>
            );
            const props = {
              className: `${styles.card} ${lesson.theme}`,
              "aria-label": `${lesson.name} хичээлд орох`,
            };
            return lesson.name === "JavaScript" ? (
              <a key={lesson.name} href={lesson.href} {...props}>
                {content}
              </a>
            ) : (
              <Link
                key={lesson.name}
                href={lesson.href}
                prefetch={false}
                {...props}
              >
                {content}
              </Link>
            );
          })}
        </nav>
        <div className={styles.howTo}>
          <Link href="/practice-tests" prefetch={false}>
            7, 8, 10, 11-р анги · Тайлбартай давтлагын тест →
          </Link>
        </div>
        <div className={styles.howTo}>
          <span>
            <strong>1</strong> Хичээлээ сонгох
          </span>
          <ArrowRight size={14} aria-hidden="true" />
          <span>
            <strong>2</strong> Сурагчийн ID-гаар орох
          </span>
          <ArrowRight size={14} aria-hidden="true" />
          <span>
            <strong>3</strong> Код бичиж эхлэх
          </span>
        </div>
      </main>
      <footer className={styles.footer}>
        <span>Oyunlag code · Код бичиж сурцгаая</span>
        <Link href="/admin" prefetch={false}>
          Багшийн орчин →
        </Link>
        <span>Кодоо бич. Турш. Дахин оролд.</span>
      </footer>
    </div>
  );
}
