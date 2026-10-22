"use client";
import Link from "next/link";
import {
  Code2,
  Users,
  GraduationCap,
  Plus,
  ArrowUpRight,
  LogOut,
  Pencil,
} from "lucide-react";
import type { Group } from "@/lib/admin/types";
import type { AdminIdentity } from "@/lib/admin/accounts";
export default function AdminNavigation({
  identity,
  groups,
  counts,
  group,
  view,
  onGroup,
  onTeachers,
  onEdit,
  onSignOut,
}: {
  identity: AdminIdentity;
  groups: Group[];
  counts: Map<string, number>;
  group: string;
  view: "students" | "teachers" | "exams";
  onGroup: (id: string) => void;
  onTeachers: () => void;
  onEdit: (group: Group | null) => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <>
      <Link href="/" className="admin-brand">
        <Code2 size={23} />
        <span>
          КодЛаб<span className="admin-brand-dot">.</span>
        </span>
      </Link>
      <div className="admin-workspace">
        <span>Oyunlag сургууль</span>
        <small>Багшийн орчин</small>
      </div>
      <nav aria-label="Багшийн цэс" className="admin-navigation">
        <Link
          href="/admin/exams"
          prefetch={false}
          aria-current={view === "exams" ? "page" : undefined}
          className={view === "exams" ? "active" : ""}
          onClick={(event) => {
            if (view === "exams") {
              event.preventDefault();
              onGroup("all");
            }
          }}
        >
          <GraduationCap size={17} />
          Шалгалтын дүн
        </Link>
        {view === "exams" ? (
          <Link href="/admin">
            <Users size={17} />
            Миний сурагчид
          </Link>
        ) : (
          <button
            className={view === "students" && group === "all" ? "active" : ""}
            aria-current={
              view === "students" && group === "all" ? "page" : undefined
            }
            onClick={() => onGroup("all")}
          >
            <Users size={17} />
            Миний сурагчид
          </button>
        )}
        {view !== "exams" && (
          <button
            className={view === "teachers" ? "active" : ""}
            aria-current={view === "teachers" ? "page" : undefined}
            onClick={onTeachers}
          >
            <GraduationCap size={17} />
            Багшийн мэдээлэл
          </button>
        )}
        <div className="admin-nav-section">
          <span>Миний ангиуд</span>
          {view !== "exams" && (
            <button
              className="admin-icon"
              aria-label="Анги нэмэх"
              onClick={() => onEdit(null)}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {groups.map((g) => (
          <div className="admin-group-row" key={g.id}>
            <button
              className={view !== "teachers" && group === g.id ? "active" : ""}
              aria-current={
                view !== "teachers" && group === g.id ? "page" : undefined
              }
              onClick={() => onGroup(g.id)}
            >
              <span className="admin-class-symbol" aria-hidden="true">
                #
              </span>
              <strong>{g.name}</strong>
              <span title="Сурагчдын тоо">{counts.get(g.id) || 0}</span>
            </button>
            {view !== "exams" && !g.grade && (
              <button
                className="admin-icon"
                aria-label={`${g.name} ангийн нэр засах`}
                onClick={() => onEdit(g)}
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        ))}
        {(counts.get("unassigned") || 0) > 0 && (
          <button
            className={group === "unassigned" ? "active" : ""}
            onClick={() => onGroup("unassigned")}
          >
            Анги оноогоогүй <span>{counts.get("unassigned")}</span>
          </button>
        )}
      </nav>
      <div className="admin-nav-bottom">
        <Link href="/">
          Хичээлүүд рүү
          <ArrowUpRight size={16} />
        </Link>
        <div className="admin-account">
          <span className="admin-account-avatar">
            {identity.name.split(" ").at(-1)?.slice(0, 1)}
          </span>
          <div>
            <strong>{identity.name}</strong>
            <small>{identity.email}</small>
          </div>
          <button
            className="admin-icon"
            aria-label="Гарах"
            title="Гарах"
            onClick={() => void onSignOut()}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
