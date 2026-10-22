import { classroomDatabase } from "./database";
export async function isRegisteredStudent(id: string) {
  return !!(await (
    await classroomDatabase()
  )
    .collection<{ _id: string; sourceId: string; deletedAt?: Date }>(
      "student_profiles",
    )
    .findOne(
      { _id: id, sourceId: { $type: "string" }, deletedAt: { $exists: false } },
      { projection: { _id: 1 } },
    ));
}
