import type { TeacherExamRow } from "./types";
export function groupExamResults(
  students: TeacherExamRow[],
  group: string,
  query: string,
) {
  const text = query.trim().toLocaleLowerCase();
  const grouped = new Map<
    string,
    { id: string; name: string; students: TeacherExamRow[] }
  >();
  for (const student of students) {
    if (group !== "all" && student.groupId !== group) continue;
    if (
      !`${student.studentId} ${student.name}`.toLocaleLowerCase().includes(text)
    )
      continue;
    let section = grouped.get(student.groupId);
    if (!section) {
      section = { id: student.groupId, name: student.className, students: [] };
      grouped.set(student.groupId, section);
    }
    section.students.push(student);
  }
  return [...grouped.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "mn"),
  );
}
