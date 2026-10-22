"use client";
import { ArrowUpRight } from "lucide-react";
import type { Group, Teacher } from "@/lib/admin/types";
export default function TeachersPanel({
  teachers,
  groups,
  onSelect,
}: {
  teachers: Teacher[];
  groups: Group[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="admin-teacher-panel" aria-label="Багшийн бүртгэл">
      {teachers.map((teacher) => {
        const assigned = groups.filter((g) =>
          g.teacherIds?.includes(teacher.id),
        );
        return (
          <article className="admin-teacher-profile" key={teacher.id}>
            <header>
              <span className="admin-account-avatar">
                {teacher.name.split(" ").at(-1)?.slice(0, 1)}
              </span>
              <div>
                <h2>{teacher.name}</h2>
                <p>{teacher.email}</p>
              </div>
            </header>
            <dl>
              <div>
                <dt>Нэвтрэх нэр</dt>
                <dd>{teacher.id}</dd>
              </div>
              <div>
                <dt>Миний сурагчид</dt>
                <dd>{teacher.studentCount}</dd>
              </div>
              <div>
                <dt>Хуваарилсан анги</dt>
                <dd>{assigned.length}</dd>
              </div>
            </dl>
            <div className="admin-teacher-groups">
              <h3>Миний ангиуд</h3>
              <div>
                {assigned.map((g) => (
                  <span className="admin-group-tag" key={g.id}>
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
            <footer>
              <p>Зөвхөн танд хуваарилсан сурагчдын мэдээлэл харагдана.</p>
              <button
                className="admin-secondary"
                onClick={() => onSelect(teacher.id)}
              >
                Сурагчдын жагсаалт
                <ArrowUpRight size={16} />
              </button>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
