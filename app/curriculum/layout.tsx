import Link from "next/link";
import { Code2 } from "lucide-react";
import styles from "./curriculum.module.css";

export default function CurriculumLayout({
  children,
}: LayoutProps<"/curriculum">) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/"
          className="classroom-wordmark"
          aria-label="Oyunlag code нүүр хуудас"
          prefetch={false}
        >
          <span className="classroom-logo">
            <Code2 size={22} aria-hidden="true" />
          </span>
          <span>
            Oyunlag <span>code</span>
          </span>
        </Link>
        <span className={styles.term}>2026–2027 оны хичээлийн жил</span>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
