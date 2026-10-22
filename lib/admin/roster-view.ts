import type { Course } from "../student/identity";
import type { StudentRow } from "./types";
export type RosterStatus = "all" | "working" | "not-started" | "complete";
export type RosterSort = "recent" | "name" | "progress";
export function learningState(student: StudentRow, course: Course | "all") {
  const summaries =
    course === "all"
      ? Object.values(student.courses)
      : student.courses[course]
        ? [student.courses[course]]
        : [];
  const completed = summaries.reduce((sum, s) => sum + s.completed, 0);
  const total = summaries.reduce((sum, s) => sum + s.total, 0);
  const started = summaries.length > 0;
  return {
    completed,
    total,
    started,
    status: !started
      ? "not-started"
      : total > 0 && completed === total
        ? "complete"
        : "working",
  };
}
export function rosterView(
  students: StudentRow[],
  {
    group,
    query,
    course,
    status,
    sort,
  }: {
    group: string;
    query: string;
    course: Course | "all";
    status: RosterStatus;
    sort: RosterSort;
  },
) {
  const search = query.trim().normalize("NFKC").toLocaleLowerCase("mn");
  const scope = students
    .filter(
      (s) =>
        group === "all" ||
        (group === "unassigned" ? !s.groupId : s.groupId === group),
    )
    .filter((s) =>
      `${s.id} ${s.name}`
        .normalize("NFKC")
        .toLocaleLowerCase("mn")
        .includes(search),
    );
  const counts = {
    all: scope.length,
    working: 0,
    "not-started": 0,
    complete: 0,
  };
  for (const s of scope) {
    const state = learningState(s, course).status;
    if (state === "working" || state === "not-started" || state === "complete")
      counts[state]++;
  }
  const filtered = scope.filter(
    (s) => status === "all" || learningState(s, course).status === status,
  );
  filtered.sort((a, b) => {
    if (sort === "name")
      return (a.name || a.id).localeCompare(b.name || b.id, "mn");
    if (sort === "progress") {
      const x = learningState(a, course),
        y = learningState(b, course);
      const difference =
        (y.total ? y.completed / y.total : 0) -
        (x.total ? x.completed / x.total : 0);
      if (difference) return difference;
    }
    return (
      (b.updatedAt || "").localeCompare(a.updatedAt || "") ||
      a.id.localeCompare(b.id, "mn")
    );
  });
  return { filtered, counts };
}
