"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Code2,
  LoaderCircle,
  UserRound,
} from "lucide-react";

const courses = {
  python: {
    name: "Python",
    mark: "Py",
    grade: "9, 10-р анги",
    placeholder: "10A-01",
    maxLength: 40,
    title: "Бодлогоос эхэлнэ.\nКодоор бүтээнэ.",
    description:
      "Хувьсагч, нөхцөл, давталтыг жижиг бодлогоор сурч, бичсэн кодынхоо үр дүнг шууд хараарай.",
    file: "hello.py",
    code: 'for i in range(3):\n    print("Би чадна!")',
    output: "Би чадна!\nБи чадна!\nБи чадна!",
    features: ["28 дасгал", "Мэдлэгийн сорил", "Чөлөөт код"],
  },
  nextjs: {
    name: "Next.js",
    mark: "N",
    grade: "Веб хөгжүүлэлт",
    placeholder: "10A-01",
    maxLength: 40,
    title: "Жижиг компонент.\nӨөрийн гэсэн веб.",
    description:
      "Компонент, props, үйлдэл, төлөвийг алхам алхмаар сурч, өөрийн интерактив вебийг бүтээгээрэй.",
    file: "page.tsx",
    code: "export default function Hello() {\n  return <h1>Сайн уу, дэлхий!</h1>;\n}",
    output: "Сайн уу, дэлхий!",
    features: ["Алхамчилсан хичээл", "Кодын шалгалт", "Шууд харах үр дүн"],
  },
  htmlcss: {
    name: "HTML & CSS",
    mark: "<>",
    grade: "6, 7, 8-р анги",
    placeholder: "6A-01",
    maxLength: 40,
    title: "HTML & CSS · Карт бүтээе",
    description:
      "HTML-ээр гарчиг, тайлбар, зураг нэм. CSS-ээр өнгө, зай, хүрээг тохируулж, үр дүнг шууд хараарай.",
    file: "index.html",
    code: "<h2>Шатрын клуб</h2>",
    output: "Шатрын клуб",
    features: [
      "5 хичээл · тус бүр 40 минут",
      "Утас, компьютерийн харагдац",
      "HTML файл татах",
    ],
  },
};

export default function CourseEntry({
  course,
  onLogin,
}: {
  course: keyof typeof courses;
  onLogin: (id: string) => Promise<unknown>;
}) {
  const info = courses[course];
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [examActive, setExamActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={`classroom-entry entry-${course}`} lang="mn">
      <header className="classroom-entry-header">
        <Link
          href="/"
          className="classroom-wordmark"
          prefetch={false}
          aria-label="КодЛаб · Хичээл сонгох"
        >
          <span className="classroom-logo">
            <Code2 size={23} />
          </span>
          <span>
            Код<span>Лаб</span>
          </span>
        </Link>
        <Link href="/" className="classroom-back" prefetch={false}>
          <ArrowLeft size={16} /> Хичээл сонгох
        </Link>
      </header>
      <main id="main-content" className="classroom-entry-main">
        <section className="classroom-story" aria-labelledby="course-heading">
          <div className="classroom-course-label">
            <span>{info.mark}</span>
            <strong>{info.name}</strong>
            <i />
            {info.grade}
          </div>
          <h1 id="course-heading">{info.title}</h1>
          <p>{info.description}</p>
          <div className="classroom-code" aria-label="Код ба үр дүнгийн жишээ">
            <div className="classroom-code-file">
              <Code2 size={15} />
              <span>{info.file}</span>
              <span>Жишээ</span>
            </div>
            <pre>{info.code}</pre>
            <div className="classroom-code-output">
              <span>ҮР ДҮН</span>
              <pre>{info.output}</pre>
              <Check size={18} />
            </div>
          </div>
          <ul className="classroom-features">
            {info.features.map((feature) => (
              <li key={feature}>
                <Check size={15} />
                {feature}
              </li>
            ))}
          </ul>
        </section>
        <section
          className="classroom-entry-card"
          aria-labelledby="entry-heading"
        >
          <div className="classroom-entry-icon">
            <UserRound size={23} />
          </div>
          <p className="classroom-eyebrow">ТАНЫ СУРАЛЦАХ ОРОН ЗАЙ</p>
          <h2 id="entry-heading">Хичээлдээ тавтай морил.</h2>
          <p className="classroom-entry-description">
            Сурагчийн ID эсвэл багшийн нэвтрэх нэрээ оруулаарай.
          </p>
          <form
            aria-busy={busy}
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              setExamActive(false);
              try {
                await onLogin(id);
              } catch (error) {
                setExamActive(
                  error instanceof Error &&
                    "status" in error &&
                    error.status === 423,
                );
                const message =
                  error instanceof Error
                    ? error.message
                    : "Холболтоо шалгаад дахин оролдоорой.";
                setError(
                  message === "Invalid student ID"
                    ? "Үсэг, тоо, цэг, зураас эсвэл доогуур зураас ашиглаарай."
                    : message,
                );
                input.current?.focus();
              } finally {
                setBusy(false);
              }
            }}
          >
            <label htmlFor="student-id">Сурагчийн ID эсвэл багшийн нэр</label>
            <input
              ref={input}
              id="student-id"
              name="studentId"
              value={id}
              required
              maxLength={info.maxLength}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={`Жишээ: ${info.placeholder}`}
              readOnly={busy}
              aria-invalid={!!error}
              aria-describedby="entry-help entry-error"
              onChange={(event) => {
                setId(event.target.value.normalize("NFKC"));
                setError("");
                setExamActive(false);
              }}
            />
            <p id="entry-help" className="classroom-field-help">
              Багш бол orgilsaikhan.ch зэрэг өөрийн нэвтрэх нэрээ ашиглаарай.
            </p>
            <p id="entry-error" role="alert" className="classroom-entry-error">
              {error}
              {examActive && (
                <>
                  {" "}
                  <Link href="/exam" prefetch={false}>
                    Шалгалтаа үргэлжлүүлэх →
                  </Link>
                </>
              )}
            </p>
            <button type="submit" className="classroom-enter" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={18} className="classroom-spinner" /> Ахиц
                  ачаалж байна…
                </>
              ) : (
                <>
                  Хичээлд орох <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <div className="classroom-save-note">
            <Cloud size={21} />
            <div>
              <strong>Эхэлсэн газраасаа үргэлжлүүлнэ</strong>
              <p>
                Код, ахиц тань ID-гаар хадгалагдана. Өөр компьютер дээр ч ижил
                ID-гаар ороорой.
              </p>
            </div>
          </div>
          <p className="classroom-id-note">Зөвхөн өөрийн ID-г ашиглаарай.</p>
        </section>
      </main>
      <footer className="classroom-entry-footer">
        <span>Кодоо бич. Турш. Дахин оролд.</span>
        <span>КодЛаб · {info.name}</span>
      </footer>
    </div>
  );
}
