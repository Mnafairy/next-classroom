import Link from "next/link";
import { ArrowRight, Check, Cloud, Code2, Monitor } from "lucide-react";
import LegacyPythonLink from "@/components/LegacyPythonLink";
import { exercises as pythonExercises } from "@/lib/python/course";
import { exercises as nextExercises } from "@/lib/course/lessons";
import { lessons as webLessons } from "@/lib/web-lab/lessons";
import { GradeCards, LessonCard, type LessonCardData } from "./lesson-cards";
import styles from "./page.module.css";

const lessons: LessonCardData[] = [
  {
    name: "HTML & CSS",
    mark: "<>",
    grade: "6, 7, 8-р анги",
    count: `${webLessons.length} хичээл`,
    description: "Гарчиг, тайлбар, зурагтай өөрийн картаа бүтээгээрэй.",
    topics: ["HTML таг", "CSS загвар", "Карт бүтээх"],
    code: '<div class="card">\n  <h2>Шатрын клуб</h2>\n</div>',
    file: "index.html",
    outcome: "Кодоо ажиллуулаад картаа харж, хариугаа шалгана.",
    href: "/web-lab",
    theme: "web",
  },
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
    theme: "python",
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
    documentLink: true,
    theme: "javascript",
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
    theme: "next",
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
        <section aria-labelledby="choose-lesson">
          <div className={styles.sectionHeading}>
            <h2 id="choose-lesson">Хичээлээ сонгоорой</h2>
            <span>Өөрийн хурдаар</span>
          </div>
          <div className={styles.cardGroupHeading}>
            <p>Мэдээллийн технологи · Ангиар</p>
            <Link href="/practice-tests" prefetch={false}>
              Давтлагын тест <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <GradeCards />
          <div className={styles.cardGroupHeading}>
            <p>Код бичих дадлага</p>
          </div>
          <nav className={styles.lessons} aria-label="Код бичих дадлага">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.name} card={lesson} />
            ))}
          </nav>
        </section>
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
