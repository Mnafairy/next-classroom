import { classroomDatabase } from "./database";
import { accountCollection } from "../admin/accounts";
import { normalizeStudentId, normalizeTeacherName } from "./identity";

export async function teacherIdByName(name: string): Promise<string | null> {
  const accounts = await accountCollection();
  const teachers = accounts
    .find({ active: true })
    .project<{ _id: string; name: string }>({ _id: 1, name: 1 });
  let id: string | null = null;
  for await (const teacher of teachers) {
    if (normalizeTeacherName(teacher.name) !== name) continue;
    if (id !== null) return null;
    id = teacher._id;
  }
  return id === null ? null : normalizeStudentId(id);
}

export async function isRegisteredLearner(id: string) {
  const student = await (
    await classroomDatabase()
  )
    .collection<{ _id: string; sourceId: string; deletedAt?: Date }>(
      "student_profiles",
    )
    .findOne(
      { _id: id, sourceId: { $type: "string" }, deletedAt: { $exists: false } },
      { projection: { _id: 1 } },
    );
  if (student) return true;
  return !!(await (
    await accountCollection()
  ).findOne(
    { _id: id.toLowerCase(), active: true },
    { projection: { _id: 1 } },
  ));
}
