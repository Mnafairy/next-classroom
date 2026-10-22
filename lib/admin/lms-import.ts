import { normalizeStudentId } from "../student/identity";
import { classroomDatabase } from "../student/database";
import { accountCollection } from "./accounts";
import { hashPassword } from "./auth";
import { adminCollections } from "./data";

export type LmsImport = {
  teachers: { id: string; sourceId: string; name: string; email: string }[];
  groups: {
    sourceId: string;
    name: string;
    grade: number;
    teacherIds: string[];
  }[];
  students: {
    id: string;
    sourceId: string;
    name: string;
    classSourceId: string;
    teacherIds: string[];
  }[];
};
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid LMS object");
  return value as Record<string, unknown>;
};
const list = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) throw new Error("Invalid LMS list");
  return value;
};
const text = (value: unknown, max = 100): string => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("Invalid LMS field");
  return value.trim();
};
export function parseLmsImport(value: unknown): LmsImport {
  const root = record(value),
    teachers: LmsImport["teachers"] = [],
    groups = new Map<string, LmsImport["groups"][number]>(),
    students = new Map<string, LmsImport["students"][number]>();
  const usernames = new Set<string>(),
    emails = new Set<string>(),
    classNames = new Map<string, string>();
  for (const item of list(root.teachers)) {
    const t = record(item),
      id = text(t.requestedUsername).toLowerCase(),
      email = text(t.email, 254).toLowerCase();
    if (
      !/^[a-z0-9][a-z0-9._-]*$/.test(id) ||
      !/^[-a-z0-9._]+@oyunlag\.edu\.mn$/.test(email) ||
      usernames.has(id) ||
      emails.has(email)
    )
      throw new Error("Invalid or duplicated teacher login");
    usernames.add(id);
    emails.add(email);
    teachers.push({
      id,
      sourceId: text(t.id),
      name: `${text(t.lastName)} ${text(t.firstName)}`,
      email,
    });
    for (const gradeValue of list(t.grades))
      for (const classValue of list(record(gradeValue).classes)) {
        const c = record(classValue),
          sourceId = text(c.id),
          name = text(c.name, 60),
          grade = c.grade;
        if (typeof grade !== "number" || ![6, 7, 8, 9, 10, 11].includes(grade))
          throw new Error("Unexpected grade");
        const key = name.normalize("NFKC").toLocaleLowerCase("mn");
        if (classNames.has(key) && classNames.get(key) !== sourceId)
          throw new Error("Ambiguous class name");
        classNames.set(key, sourceId);
        let group = groups.get(sourceId);
        if (group && (group.name !== name || group.grade !== grade))
          throw new Error("Conflicting class records");
        if (!group) {
          group = { sourceId, name, grade, teacherIds: [] };
          groups.set(sourceId, group);
        }
        if (!group.teacherIds.includes(id)) group.teacherIds.push(id);
        for (const courseValue of list(c.courses))
          for (const studentValue of list(record(courseValue).students)) {
            const s = record(studentValue),
              studentId = normalizeStudentId(text(s.studentCode, 40)),
              lmsId = text(s.id);
            if (text(s.classId) !== sourceId)
              throw new Error("Student class does not match");
            const name = text(s.displayName, 80),
              previous = students.get(studentId);
            if (
              previous &&
              (previous.sourceId !== lmsId ||
                previous.classSourceId !== sourceId ||
                previous.name !== name)
            )
              throw new Error("Conflicting student records");
            const student = previous || {
              id: studentId,
              sourceId: lmsId,
              name,
              classSourceId: sourceId,
              teacherIds: [],
            };
            if (!student.teacherIds.includes(id)) student.teacherIds.push(id);
            students.set(studentId, student);
          }
      }
  }
  if (teachers.length !== 3) throw new Error("Expected exactly three teachers");
  if (
    new Set([...students.values()].map((s) => s.sourceId)).size !==
    students.size
  )
    throw new Error("One LMS student has multiple codes");
  return {
    teachers,
    groups: [...groups.values()],
    students: [...students.values()],
  };
}
export async function applyLmsImport(plan: LmsImport) {
  const { profiles, groups } = await adminCollections(),
    accounts = await accountCollection();
  const [existingGroups, existingProfiles, existingAccounts] =
    await Promise.all([
      groups.find({}).toArray(),
      profiles.find({}).toArray(),
      accounts.find({}).toArray(),
    ]);
  const classIds = new Map<string, string>();
  for (const group of plan.groups) {
    const key = group.name.normalize("NFKC").toLocaleLowerCase("mn");
    const existing =
      existingGroups.find((g) => g.sourceId === group.sourceId) ||
      existingGroups.find((g) => g.key === key);
    if (existing?.sourceId && existing.sourceId !== group.sourceId)
      throw new Error("Class source conflict");
    classIds.set(
      group.sourceId,
      existing ? existing._id : `lms-${group.sourceId}`,
    );
  }
  for (const student of plan.students) {
    const existing = existingProfiles.find((p) => p._id === student.id);
    if (existing?.sourceId && existing.sourceId !== student.sourceId)
      throw new Error("Student source conflict");
  }
  for (const teacher of plan.teachers) {
    if (
      existingAccounts.some(
        (a) =>
          (a.email === teacher.email && a._id !== teacher.id) ||
          (a._id === teacher.id && a.email !== teacher.email),
      )
    )
      throw new Error("Admin identity conflict");
  }
  await groups.createIndex({ key: 1 }, { unique: true });
  await accounts.createIndex({ email: 1 }, { unique: true });
  for (const group of plan.groups)
    await groups.updateOne(
      { _id: classIds.get(group.sourceId)! },
      {
        $set: {
          name: group.name,
          key: group.name.normalize("NFKC").toLocaleLowerCase("mn"),
          sourceId: group.sourceId,
          grade: group.grade,
          teacherIds: group.teacherIds,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  for (const teacher of plan.teachers) {
    const passwordHash = existingAccounts.some((a) => a._id === teacher.id)
      ? undefined
      : await hashPassword(teacher.email);
    await accounts.updateOne(
      { _id: teacher.id },
      {
        $set: {
          name: teacher.name,
          email: teacher.email,
          sourceId: teacher.sourceId,
        },
        $setOnInsert: {
          active: true,
          ...(passwordHash ? { passwordHash } : {}),
        },
      },
      { upsert: true },
    );
  }
  if (plan.students.length)
    await profiles.bulkWrite(
      plan.students.map((s) => ({
        updateOne: {
          filter: { _id: s.id },
          update: {
            $set: {
              name: s.name,
              sourceId: s.sourceId,
              groupId: classIds.get(s.classSourceId)!,
              teacherIds: s.teacherIds,
              updatedAt: new Date(),
            },
            $setOnInsert: { notes: "" },
          },
          upsert: true,
        },
      })),
    );
  const db = await classroomDatabase();
  // Old shared-password sessions have no account identity and cannot authorize requests.
  return {
    teachers: plan.teachers.length,
    classes: plan.groups.length,
    students: plan.students.length,
    progressRecords: await db.collection("student_progress").countDocuments(),
  };
}
