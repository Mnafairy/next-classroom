"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Code2,
  Download,
  Menu,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { EXAM_MINUTES, EXAM_GRADE_LABEL } from "@/lib/exam/content";
import type { AdminIdentity } from "@/lib/admin/accounts";
import type { teacherExamDetail } from "@/lib/exam/service";
import type { TeacherExamRow } from "@/lib/exam/types";
import { groupExamResults } from "@/lib/exam/results-view";
import { adminRequest, downloadCsv } from "./api";
import AdminDialog from "./AdminDialog";
import AdminNavigation from "./AdminNavigation";
import ExamResultGroup, { examStatusLabels as labels } from "./ExamResultGroup";
import ExamCodeDialog from "./ExamCodeDialog";
import ResetExamDialog from "./ResetExamDialog";
import ExamAttemptDetail from "./ExamAttemptDetail";
import ResetClassExamDialog, {
  type ClassResetSelection,
} from "./ResetClassExamDialog";
import { useRouter } from "next/navigation";

export default function ExamResults({ identity }: { identity: AdminIdentity }) {
  const router = useRouter();
  const [rows, setRows] = useState<TeacherExamRow[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [group, setGroup] = useState("all"),
    [query, setQuery] = useState(""),
    [navigationOpen, setNavigationOpen] = useState(false),
    [notice, setNotice] = useState("");
  const [codeStudent, setCodeStudent] = useState<TeacherExamRow | null>(null);
  const [classReset, setClassReset] = useState<ClassResetSelection | null>(
    null,
  );
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const loadVersion = useRef(0);
  const [detail, setDetail] = useState<Awaited<
      ReturnType<typeof teacherExamDetail>
    > | null>(null),
    [opening, setOpening] = useState(false),
    [pendingReset, setPendingReset] = useState<TeacherExamRow | null>(null);
  const load = useCallback(() => {
    const version = ++loadVersion.current;
    return adminRequest<{ students: TeacherExamRow[] }>("/api/admin/exam")
      .then((data) => {
        if (version !== loadVersion.current) return;
        setRows(data.students);
        setUpdatedAt(new Date());
        setError("");
      })
      .catch((e) => {
        if (version === loadVersion.current) setError(e.message);
      })
      .finally(() => {
        if (version === loadVersion.current) setLoading(false);
      });
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 30000);
    return () => clearInterval(timer);
  }, [load]);
  const groups = [
    ...new Map(
      rows.map((s) => [
        s.groupId,
        { id: s.groupId, name: s.className, grade: s.grade },
      ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, "mn"));
  const counts = new Map(
    groups.map((g) => [g.id, rows.filter((s) => s.groupId === g.id).length]),
  );
  const sections = groupExamResults(rows, group, query);
  const filtered = sections.flatMap((section) => section.students);
  const selectedClass = groups.find((g) => g.id === group);
  const classStudents = rows.filter((student) => student.groupId === group);
  const resettable = classStudents.filter(
    (student) => student.status !== "not-started" && student.status !== "reset",
  );
  const graded = filtered.filter((student) => student.total !== null);
  const activeCount = filtered.filter(
    (student) => student.status === "active",
  ).length;
  const readyCount = filtered.filter(
    (student) => student.status === "reset",
  ).length;
  function requestClassReset() {
    if (!selectedClass || !resettable.length) return;
    setClassReset({
      id: selectedClass.id,
      name: selectedClass.name,
      targets: resettable.map(({ studentId, generation }) => ({
        studentId,
        generation,
      })),
      active: resettable.filter((student) => student.status === "active")
        .length,
      untouched: classStudents.length - resettable.length,
    });
  }
  function selectGroup(id: string) {
    setGroup(id);
    setQuery("");
    setNavigationOpen(false);
  }
  async function signOut() {
    try {
      await adminRequest("/api/admin/session", { method: "DELETE" });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Дахин оролдоно уу.");
    }
  }
  const navigation = (
    <AdminNavigation
      identity={identity}
      groups={groups}
      counts={counts}
      group={group}
      view="exams"
      onGroup={selectGroup}
      onTeachers={() => {}}
      onEdit={() => {}}
      onSignOut={signOut}
    />
  );
  async function open(id: string) {
    setOpening(true);
    try {
      setDetail(
        await adminRequest(
          `/api/admin/exam?studentId=${encodeURIComponent(id)}`,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Дахин оролдоно уу.");
    } finally {
      setOpening(false);
    }
  }
  function csv() {
    downloadCsv([
      [
        "ID",
        "Нэр",
        "Анги",
        "Төлөв",
        "Тест /40",
        "Код /60",
        "Нийт /100",
        "Цонхноос шилжсэн",
        "Эхэлсэн",
        "Илгээсэн",
      ],
      ...filtered.map((s) => [
        s.studentId,
        s.name,
        s.className,
        labels[s.status],
        s.quizPoints ?? "",
        s.codePoints ?? "",
        s.total ?? "",
        s.departures,
        s.startedAt || "",
        s.submittedAt || "",
      ]),
    ]);
  }
  return (
    <div className="admin-shell">
      <header className="admin-mobile-header">
        <button
          className="admin-icon"
          aria-label="Ангийн цэс нээх"
          onClick={() => setNavigationOpen(true)}
        >
          <Menu size={21} />
        </button>
        <Link href="/admin" className="admin-brand">
          <Code2 size={22} />
          <span>КодЛаб.</span>
        </Link>
        <span className="admin-mobile-account">
          {identity.name.split(" ").at(-1)}
        </span>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">{navigation}</aside>
        <main id="main-content" className="admin-main admin-exam-main">
          <div className="admin-exam-title">
            <div>
              <p className="admin-breadcrumb">
                Багшийн орчин /{" "}
                {selectedClass ? `${selectedClass.name} анги` : "Миний ангиуд"}
              </p>
              <h1>Шалгалтын дүн</h1>
              <p>
                {EXAM_GRADE_LABEL} · JavaScript · {EXAM_MINUTES} минут · 100
                оноо
              </p>
            </div>
            <Link
              href="/exam"
              className="admin-secondary"
              aria-label="Сурагчийн шалгалт"
              title="Сурагчийн шалгалт нээх"
            >
              <span>Сурагчийн шалгалт</span> <ArrowUpRight size={15} />
            </Link>
          </div>
          {notice && (
            <div className="admin-exam-notice" role="status">
              {notice}
              <button
                className="admin-icon"
                aria-label="Мэдэгдэл хаах"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <section className="admin-exam-register" aria-label="Шалгалтын дүн">
            <div className="admin-exam-controls">
              <label className="admin-exam-class-filter">
                <span className="admin-sr-only">Анги</span>
                <select
                  value={group}
                  onChange={(e) => selectGroup(e.target.value)}
                >
                  <option value="all">Бүх анги</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-search">
                <Search size={16} />
                <span className="admin-sr-only">Нэр / ID</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Нэр эсвэл сурагчийн ID…"
                />
              </label>
              <button
                className="admin-icon"
                onClick={() => void load()}
                aria-label="Шалгалтын дүн шинэчлэх"
              >
                <RefreshCw size={16} />
              </button>
              <button
                className="admin-secondary admin-exam-export"
                onClick={csv}
                disabled={!filtered.length}
              >
                <Download size={16} />
                CSV татах
              </button>
            </div>
            <div
              className="admin-exam-overview"
              aria-label="Харагдаж буй сурагчдын шалгалтын тойм"
            >
              <div>
                <span>Нийт сурагч</span>
                <strong>{loading ? "—" : filtered.length}</strong>
              </div>
              <div>
                <span>Үнэлэгдсэн</span>
                <strong>{loading ? "—" : graded.length}</strong>
              </div>
              <div>
                <span>Өгч байна</span>
                <strong>{loading ? "—" : activeCount}</strong>
              </div>
              <div>
                <span>Дахин өгөхөд бэлэн</span>
                <strong>{loading ? "—" : readyCount}</strong>
              </div>
            </div>
            <p className="admin-exam-mobile-summary">
              {loading
                ? "Дүнг ачаалж байна…"
                : `${graded.length}/${filtered.length} үнэлэгдсэн · ${activeCount} өгч байна · ${readyCount} дахин өгөхөд бэлэн`}
            </p>
            <div className="admin-class-exam-action">
              <div>
                <h2>
                  {selectedClass
                    ? `${selectedClass.name} анги`
                    : "Миний ангиуд"}
                </h2>
                <p>
                  {selectedClass
                    ? `${classStudents.length} сурагч · Зөвхөн таны хуваарилалт`
                    : "Анги сонгоод бүх сурагчид дахин өгөх эрхийг нэг дор нээнэ."}
                </p>
              </div>
              {selectedClass && (
                <button
                  className="admin-secondary admin-class-reset-button"
                  disabled={!resettable.length || loading}
                  onClick={requestClassReset}
                >
                  <RotateCcw size={16} /> Ангид дахин өгөх эрх нээх
                  {resettable.length ? ` (${resettable.length})` : ""}
                </button>
              )}
              {selectedClass && !loading && !resettable.length && (
                <span className="admin-exam-empty-hint">
                  Шинэчлэх оролдлого алга
                </span>
              )}
            </div>
            {error && (
              <p role="alert" className="admin-error">
                {error}
              </p>
            )}
            {loading ? (
              <p role="status">Шалгалтын дүнг ачаалж байна…</p>
            ) : sections.length ? (
              sections.map((section) => (
                <ExamResultGroup
                  key={section.id}
                  name={section.name}
                  students={section.students}
                  opening={opening}
                  onOpen={(id) => void open(id)}
                  onIssue={setCodeStudent}
                  onReset={setPendingReset}
                  onSelect={
                    group === "all" ? () => selectGroup(section.id) : undefined
                  }
                />
              ))
            ) : (
              <div className="admin-exam-empty">
                <h2>Тохирох сурагч алга</h2>
                <p>Нэр, ID эсвэл ангийн шүүлтээ шалгана уу.</p>
                <button
                  className="admin-text"
                  onClick={() => {
                    setQuery("");
                    selectGroup("all");
                  }}
                >
                  Шүүлт цэвэрлэх
                </button>
              </div>
            )}
            <footer>
              <span>{filtered.length} сурагч · Зөвхөн таны хуваарилалт</span>
              <span>
                {updatedAt
                  ? `Шинэчилсэн ${updatedAt.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}`
                  : "Ачаалж байна…"}{" "}
                · 30 сек
              </span>
            </footer>
          </section>
          <p className="admin-exam-note">
            Цонхноос шилжсэн тоо нь ажиглалтын бүртгэл; дангаараа хуулсан
            гэдгийг нотлохгүй.
          </p>
          {detail && (
            <ExamAttemptDetail
              detail={detail}
              onClose={() => setDetail(null)}
            />
          )}
        </main>
      </div>
      {navigationOpen && (
        <AdminDialog
          title="Миний ангиуд"
          onClose={() => setNavigationOpen(false)}
        >
          <div className="admin-mobile-navigation">{navigation}</div>
        </AdminDialog>
      )}
      {codeStudent && (
        <ExamCodeDialog
          student={codeStudent}
          onClose={() => setCodeStudent(null)}
        />
      )}
      {pendingReset && (
        <ResetExamDialog
          student={pendingReset}
          onClose={() => setPendingReset(null)}
          onReset={() => {
            setNotice(
              `${pendingReset.name} (${pendingReset.studentId}) дахин шалгалт өгөхөд бэлэн. Шинээр нэвтрэхэд ${EXAM_MINUTES} минут эхэлнэ.`,
            );
            setPendingReset(null);
            setDetail(null);
            void load();
          }}
        />
      )}
      {classReset && (
        <ResetClassExamDialog
          selection={classReset}
          onClose={() => setClassReset(null)}
          onReset={(result) => {
            setNotice(
              `${classReset.name} анги: ${result.ready.length} сурагч дахин өгөхөд бэлэн.${result.changed.length ? ` ${result.changed.length} сурагчийн мэдээлэл өөрчлөгдсөн тул шинэчлээгүй.` : ""}${result.failed.length ? ` ${result.failed.length} оролдлого шинэчлэгдсэнгүй. Жагсаалтаа шалгаад дахин оролдоно уу.` : ""} Шинээр нэвтрэхэд ${EXAM_MINUTES} минут эхэлнэ.`,
            );
            setClassReset(null);
            setDetail(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
