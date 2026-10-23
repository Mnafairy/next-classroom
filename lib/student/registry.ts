import { classroomDatabase } from "./database";
import { accountCollection } from "../admin/accounts";

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
