"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  GraduationCap,
  Menu,
  RefreshCw,
  Search,
  Users,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { AdminIdentity } from "@/lib/admin/accounts";
import type { Group, Roster, StudentRow } from "@/lib/admin/types";
import {
  rosterView,
  type RosterSort,
  type RosterStatus,
} from "@/lib/admin/roster-view";
import { courses, type Course } from "@/lib/student/identity";
import {
  adminRequest,
  courseLabels,
  dateLabel,
  downloadCsv,
  saveAdmin,
} from "./api";
import AdminDialog from "./AdminDialog";
import AddStudentDialog from "./AddStudentDialog";
import AdminNavigation from "./AdminNavigation";
import { GroupEditor, AddStudents } from "./RosterDialogs";
import StudentDetail from "./StudentDetail";
import DeleteStudentDialog from "./DeleteStudentDialog";
import StudentTableRow from "./StudentTableRow";
import TeachersPanel from "./TeachersPanel";

const statusOptions: { id: RosterStatus; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "working", label: "Ажиллаж байгаа" },
  { id: "not-started", label: "Эхлээгүй" },
  { id: "complete", label: "Дуусгасан" },
];
const sortOptions: { id: RosterSort; label: string }[] = [
  { id: "recent", label: "Сүүлд ажилласан" },
  { id: "name", label: "Нэрийн дарааллаар" },
  { id: "progress", label: "Ахиц өндөр эхэнд" },
];
const PAGE_SIZE = 25;
export default function AdminDashboard({
  identity,
}: {
  identity: AdminIdentity;
}) {
  const [data, setData] = useState<Roster | null>(null),
    [error, setError] = useState(""),
    [refreshing, setRefreshing] = useState(true);
  const [view, setView] = useState<"students" | "teachers">("students"),
    [group, setGroup] = useState("all"),
    [query, setQuery] = useState(""),
    [course, setCourse] = useState<Course | "all">("all"),
    [status, setStatus] = useState<RosterStatus>("all"),
    [sort, setSort] = useState<RosterSort>("recent"),
    [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set()),
    [assignGroup, setAssignGroup] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [deletedId, setDeletedId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null),
    [pendingDelete, setPendingDelete] = useState<StudentRow | null>(null),
    [groupEditor, setGroupEditor] = useState<Group | null | undefined>(
      undefined,
    ),
    [addStudents, setAddStudents] = useState(false),
    [addingStudent, setAddingStudent] = useState(false),
    [navigationOpen, setNavigationOpen] = useState(false);
  const requestVersion = useRef(0);
  const load = useCallback(() => {
    const version = ++requestVersion.current;
    return adminRequest<Roster>("/api/admin")
      .then((next) => {
        if (version === requestVersion.current) {
          setData(next);
          setError("");
        }
      })
      .catch((error) => {
        if (version === requestVersion.current)
          setError(
            error instanceof Error
              ? error.message
              : "Холболтоо шалгаад дахин оролдоно уу.",
          );
      })
      .finally(() => {
        if (version === requestVersion.current) setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, [load]);
  const students = data?.students || [],
    groups = data?.groups || [];
  const { filtered, counts } = rosterView(students, {
    group,
    query,
    course,
    status,
    sort,
  });
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1),
  );
  const visible = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const allChecked =
    visible.length > 0 && visible.every((s) => selected.has(s.id));
  const groupCounts = new Map<string, number>();
  for (const student of students) {
    const key = student.groupId || "unassigned";
    groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
  }
  const groupName =
    group === "all"
      ? "Миний сурагчид"
      : group === "unassigned"
        ? "Анги оноогоогүй"
        : `${groups.find((g) => g.id === group)?.name || "Миний"} анги`;
  const openedStudent = students.find((s) => s.id === studentId);
  function selectGroup(id: string) {
    setGroup(id);
    setView("students");
    setPage(0);
    setQuery("");
    setStatus("all");
    setSelected(new Set());
    setNavigationOpen(false);
  }
  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function exportRoster() {
    downloadCsv([
      [
        "Сурагчийн ID",
        "Нэр",
        "Анги",
        ...courses.flatMap((course) => [
          `${courseLabels[course]} дууссан`,
          `${courseLabels[course]} нийт`,
        ]),
        "Сүүлд хадгалсан",
      ],
      ...filtered.map((s) => [
        s.id,
        s.name,
        groups.find((g) => g.id === s.groupId)?.name || "",
        ...courses.flatMap((c) => [
          s.courses[c]?.completed || 0,
          s.courses[c]?.total || 0,
        ]),
        s.updatedAt || "",
      ]),
    ]);
  }
  async function signOut() {
    try {
      await adminRequest("/api/admin/session", { method: "DELETE" });
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Дахин оролдоно уу.");
    }
  }
  const navigation = (
    <AdminNavigation
      identity={identity}
      groups={groups}
      counts={groupCounts}
      group={group}
      view={view}
      onGroup={selectGroup}
      onTeachers={() => {
        setView("teachers");
        setNavigationOpen(false);
      }}
      onEdit={(g) => {
        setGroupEditor(g);
        setNavigationOpen(false);
      }}
      onSignOut={signOut}
    />
  );
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
        <Link href="/" className="admin-brand">
          <Code2 size={22} />
          <span>КодЛаб.</span>
        </Link>
        <span className="admin-mobile-account">
          {identity.name.split(" ").at(-1)}
        </span>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">{navigation}</aside>
        <main id="main-content" className="admin-main">
          <div className="admin-title-row">
            <div>
              <p className="admin-breadcrumb">
                Багшийн орчин <ChevronRight size={13} />{" "}
                {view === "teachers"
                  ? "Миний бүртгэл"
                  : group === "all"
                    ? "Сурагчдын ахиц"
                    : groups.find((g) => g.id === group)?.name || "Анги"}
              </p>
              <h1>{view === "teachers" ? "Багшийн мэдээлэл" : groupName}</h1>
              <p className="admin-scope-note">
                {view === "teachers"
                  ? identity.email
                  : course === "all"
                    ? "Танд хуваарилсан сурагчдын хадгалсан ажил, дасгалын ахиц."
                    : `${courseLabels[course]} хичээлийн хадгалсан ажил, дасгалын ахиц.`}
              </p>
            </div>
            {view === "students" && (
              <div className="admin-title-actions">
                <Link href="/admin/exams" className="admin-secondary">
                  <GraduationCap size={16} />
                  Шалгалтын дүн
                </Link>
                <button
                  className="admin-secondary admin-assign-button"
                  aria-label="Сурагч хуваарилах"
                  onClick={() => setAddStudents(true)}
                >
                  <UserRoundPlus size={16} />
                  <span>Сурагч хуваарилах</span>
                </button>
                <button
                  className="admin-primary"
                  disabled={!data}
                  onClick={() => setAddingStudent(true)}
                >
                  <UserRoundPlus size={16} />
                  Сурагч нэмэх
                </button>
              </div>
            )}
          </div>
          {view === "teachers" ? (
            <TeachersPanel
              teachers={data?.teachers || []}
              groups={groups}
              onSelect={() => selectGroup("all")}
            />
          ) : (
            <>
              <div
                className="admin-overview"
                aria-label="Сонгосон сурагчдын тойм"
              >
                <div>
                  <span>Нийт сурагч</span>
                  <strong>{data ? counts.all : "—"}</strong>
                </div>
                <div>
                  <span>Ажил хадгалсан</span>
                  <strong>
                    {data ? counts.working + counts.complete : "—"}
                  </strong>
                </div>
                <div>
                  <span>Эхлээгүй</span>
                  <strong>{data ? counts["not-started"] : "—"}</strong>
                </div>
              </div>
              <section className="admin-roster" aria-label="Сурагчдын жагсаалт">
                <div className="admin-roster-heading">
                  <h2>Сурагчдын ахиц</h2>
                  <div className="admin-roster-tools">
                    <button
                      className={`admin-icon ${refreshing ? "admin-refreshing" : ""}`}
                      aria-label="Жагсаалт шинэчлэх"
                      disabled={refreshing}
                      onClick={() => {
                        setRefreshing(true);
                        void load();
                      }}
                    >
                      <RefreshCw size={17} />
                    </button>
                    <button
                      className="admin-secondary admin-export"
                      aria-label="CSV татах"
                      disabled={!filtered.length}
                      onClick={exportRoster}
                    >
                      <Download size={15} />
                      <span>CSV татах</span>
                    </button>
                  </div>
                </div>
                <div className="admin-roster-toolbar">
                  <label className="admin-search">
                    <Search size={17} />
                    <span className="admin-sr-only">ID эсвэл нэрээр хайх</span>
                    <input
                      type="search"
                      placeholder="Нэр эсвэл сурагчийн ID…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(0);
                      }}
                    />
                  </label>
                  <label className="admin-filter">
                    <span className="admin-sr-only">Ангийн шүүлт</span>
                    <select
                      aria-label="Ангиар шүүх"
                      value={group}
                      onChange={(e) => selectGroup(e.target.value)}
                    >
                      <option value="all">Бүх анги</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                      {(groupCounts.get("unassigned") || 0) > 0 && (
                        <option value="unassigned">Анги оноогоогүй</option>
                      )}
                    </select>
                  </label>
                  <label className="admin-filter">
                    <span className="admin-sr-only">Хичээлийн шүүлт</span>
                    <select
                      aria-label="Хичээлээр шүүх"
                      value={course}
                      onChange={(e) => {
                        setCourse(
                          courses.find((c) => c === e.target.value) || "all",
                        );
                        setPage(0);
                      }}
                    >
                      <option value="all">Бүх хичээл</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {courseLabels[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-sort-control" title="Эрэмбэлэх">
                    <ArrowDownUp size={15} />
                    <select
                      className="admin-sort"
                      aria-label="Эрэмбэлэх"
                      value={sort}
                      onChange={(e) => {
                        setSort(
                          sortOptions.find((s) => s.id === e.target.value)
                            ?.id || "recent",
                        );
                        setPage(0);
                      }}
                    >
                      {sortOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div
                  className="admin-status-tabs"
                  role="group"
                  aria-label="Ахицаар шүүх"
                >
                  {statusOptions.map((s) => (
                    <button
                      key={s.id}
                      aria-pressed={status === s.id}
                      onClick={() => {
                        setStatus(s.id);
                        setPage(0);
                      }}
                    >
                      {s.label}
                      <span>{data ? counts[s.id] : "—"}</span>
                    </button>
                  ))}
                </div>
                {error && (
                  <div className="admin-inline-error" role="alert">
                    <p>
                      {error}
                      {data && (
                        <small>
                          Сүүлд шинэчилсэн: {dateLabel(data.fetchedAt)}
                        </small>
                      )}
                    </p>
                    <button
                      className="admin-secondary"
                      disabled={refreshing}
                      onClick={() => {
                        setRefreshing(true);
                        void load();
                      }}
                    >
                      Дахин оролдох
                    </button>
                  </div>
                )}
                {notice && (
                  <div className="admin-notice" role="status">
                    <span>{notice}</span>
                    {deletedId && (
                      <button
                        className="admin-text"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await saveAdmin({
                              action: "restore",
                              studentId: deletedId,
                            });
                            setDeletedId(null);
                            await load();
                            setNotice("Сурагчийг сэргээсэн.");
                          } catch (error) {
                            setError(
                              error instanceof Error ? error.message : "Алдаа",
                            );
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Сэргээх
                      </button>
                    )}
                    <button
                      className="admin-icon"
                      aria-label="Мэдэгдэл хаах"
                      onClick={() => {
                        setNotice("");
                        setDeletedId(null);
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
                {!!selected.size && (
                  <div className="admin-bulk">
                    <strong>{selected.size} сурагч сонгосон</strong>
                    <select
                      aria-label="Сонгосон сурагчдад анги оноох"
                      value={assignGroup}
                      onChange={(e) => setAssignGroup(e.target.value)}
                    >
                      <option value="" disabled>
                        Анги сонгох
                      </option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                      <option value="unassigned">Анги оноогоогүй</option>
                    </select>
                    <button
                      className="admin-primary"
                      disabled={busy || !assignGroup}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await saveAdmin({
                            action: "assign",
                            studentIds: [...selected],
                            groupId:
                              assignGroup === "unassigned" ? null : assignGroup,
                          });
                          setSelected(new Set());
                          setAssignGroup("");
                          await load();
                          setNotice("Ангийн хуваарилалтыг хадгаллаа.");
                        } catch (error) {
                          setError(
                            error instanceof Error ? error.message : "Алдаа",
                          );
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Хуваарилах
                    </button>
                    <button
                      className="admin-text"
                      onClick={() => setSelected(new Set())}
                    >
                      Болих
                    </button>
                  </div>
                )}
                {!data && refreshing ? (
                  <div
                    className="admin-skeleton"
                    role="status"
                    aria-label="Сурагчдын ахицыг ачаалж байна"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i}>
                        <span />
                        <span />
                        <span />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="admin-table-scroll">
                      <table className="admin-students-table">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                aria-label="Энэ хуудсын сурагчдыг сонгох"
                                checked={allChecked}
                                onChange={() =>
                                  setSelected((previous) => {
                                    const next = new Set(previous);
                                    visible.forEach((s) =>
                                      allChecked
                                        ? next.delete(s.id)
                                        : next.add(s.id),
                                    );
                                    return next;
                                  })
                                }
                              />
                            </th>
                            <th>Сурагч</th>
                            <th>Анги</th>
                            {courses.map((c) => (
                              <th className="admin-numeric" key={c}>
                                {courseLabels[c]}
                              </th>
                            ))}
                            <th className="admin-numeric">Сүүлд хадгалсан</th>
                            <th>
                              <span className="admin-sr-only">
                                Сурагчийн үйлдлүүд
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((student) => (
                            <StudentTableRow
                              key={student.id}
                              student={student}
                              groups={groups}
                              selected={selected.has(student.id)}
                              onToggle={() => toggle(student.id)}
                              onOpen={() => setStudentId(student.id)}
                              disabled={busy}
                              onDelete={() => setPendingDelete(student)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!visible.length && (
                      <div className="admin-empty">
                        <Users size={25} />
                        <h3>
                          {students.length
                            ? "Тохирох сурагч олдсонгүй"
                            : "Одоогоор сурагч алга"}
                        </h3>
                        <p>
                          {students.length
                            ? "Өөр нэр, ID-аар хайх эсвэл шүүлтээ цэвэрлээрэй."
                            : "Сурагч нэмэх товчоор өөрийн ангид шинэ сурагч бүртгээрэй."}
                        </p>
                        {!!students.length && (
                          <button
                            className="admin-secondary"
                            onClick={() => {
                              setQuery("");
                              setStatus("all");
                              setCourse("all");
                            }}
                          >
                            Шүүлт цэвэрлэх
                          </button>
                        )}
                      </div>
                    )}
                    <footer className="admin-table-footer">
                      <span>
                        {filtered.length ? currentPage * PAGE_SIZE + 1 : 0}–
                        {Math.min(
                          (currentPage + 1) * PAGE_SIZE,
                          filtered.length,
                        )}{" "}
                        / {filtered.length} сурагч
                      </span>
                      <div>
                        <button
                          className="admin-secondary"
                          aria-label="Өмнөх хуудас"
                          disabled={currentPage === 0}
                          onClick={() => setPage(currentPage - 1)}
                        >
                          <ChevronLeft size={15} />
                          <span>Өмнөх</span>
                        </button>
                        <span>
                          {currentPage + 1} /{" "}
                          {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
                        </span>
                        <button
                          className="admin-secondary"
                          aria-label="Дараах хуудас"
                          disabled={
                            (currentPage + 1) * PAGE_SIZE >= filtered.length
                          }
                          onClick={() => setPage(currentPage + 1)}
                        >
                          <span>Дараах</span>
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </footer>
                  </>
                )}
              </section>
              <p className="admin-data-note">
                <span className="admin-live-dot" />
                Минут тутам шинэчлэгдэнэ
                {data && <> · Сүүлд {dateLabel(data.fetchedAt)}</>}
                {data?.truncated && " · Жагсаалтын хязгаарт хүрсэн."}
              </p>
            </>
          )}
        </main>
      </div>
      {navigationOpen && (
        <AdminDialog
          title="Миний орчин"
          onClose={() => setNavigationOpen(false)}
        >
          <div className="admin-mobile-navigation">{navigation}</div>
        </AdminDialog>
      )}
      {pendingDelete && (
        <DeleteStudentDialog
          student={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onDeleted={async () => {
            setDeletedId(pendingDelete.id);
            setSelected((previous) => {
              const next = new Set(previous);
              next.delete(pendingDelete.id);
              return next;
            });
            await load();
            setNotice("Сурагчийг жагсаалтаас устгалаа.");
            setPendingDelete(null);
          }}
        />
      )}
      {openedStudent && (
        <StudentDetail
          key={openedStudent.id}
          student={openedStudent}
          groups={groups}
          onClose={() => setStudentId(null)}
          onSaved={load}
        />
      )}
      {groupEditor !== undefined && (
        <GroupEditor
          group={groupEditor}
          onClose={() => setGroupEditor(undefined)}
          onSaved={async () => {
            await load();
            setGroupEditor(undefined);
            setNotice("Ангийн мэдээллийг хадгаллаа.");
          }}
        />
      )}
      {addingStudent && (
        <AddStudentDialog
          groups={groups}
          defaultGroup={groups.some((g) => g.id === group) ? group : ""}
          onClose={() => setAddingStudent(false)}
          onSaved={async (student) => {
            selectGroup(student.groupId);
            setCourse("all");
            setQuery(student.id);
            setDeletedId(null);
            setNotice(`${student.name} (${student.id}) сурагчийг нэмлээ.`);
            await load();
            setAddingStudent(false);
          }}
        />
      )}
      {addStudents && (
        <AddStudents
          groups={groups}
          defaultGroup={groups.some((g) => g.id === group) ? group : ""}
          onClose={() => setAddStudents(false)}
          onSaved={async () => {
            await load();
            setAddStudents(false);
            setNotice("Ангийн хуваарилалтыг хадгаллаа.");
          }}
        />
      )}
    </div>
  );
}
