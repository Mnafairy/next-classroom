import { accountCollection } from "./accounts";
import { randomUUID } from "node:crypto";
import { classroomDatabase, progressCollection } from "../student/database";
import { normalizeStudentId, courses, type Course } from "../student/identity";
import { catalog, detail, parseProgress, summarize } from "./progress";
import type { Roster, StudentRow } from "./types";

type Profile = {
  _id: string;
  name: string;
  notes: string;
  groupId: string | null;
  updatedAt: Date;
  sourceId?: string;
  manualEnrollment?: boolean;
  teacherIds?: string[];
  deletedAt?: Date;
  deletedBy?: string;
};
type ClassGroup = {
  _id: string;
  name: string;
  key: string;
  createdAt: Date;
  sourceId?: string;
  grade?: number;
  teacherIds?: string[];
};
export async function adminCollections() {
  const db = await classroomDatabase();
  return {
    profiles: db.collection<Profile>("student_profiles"),
    groups: db.collection<ClassGroup>("student_groups"),
  };
}
export class InputError extends Error {}
const string = (value: unknown, max: number) => {
  if (typeof value !== "string" || value.length > max)
    throw new InputError("Талбарын утгаа шалгана уу.");
  return value.trim();
};
const studentId = (value: unknown) => {
  try {
    return normalizeStudentId(value);
  } catch {
    throw new InputError("Сурагчийн ID буруу байна.");
  }
};
export async function roster(teacherId: string): Promise<Roster> {
  const { profiles, groups } = await adminCollections();
  const collection = await progressCollection();
  const people = await profiles
    .find({
      teacherIds: teacherId,
      sourceId: { $type: "string" },
      deletedAt: { $exists: false },
    })
    .limit(10001)
    .toArray();
  const [saved, classes, teachers] = await Promise.all([
    collection
      .find(
        { studentId: { $in: people.map((p) => p._id) } },
        {
          projection: {
            studentId: 1,
            course: 1,
            updatedAt: 1,
            adminSummary: 1,
          },
        },
      )
      .limit(10001)
      .toArray(),
    groups
      .find({ teacherIds: teacherId })
      .sort({ grade: 1, name: 1 })
      .limit(500)
      .toArray(),
    (await accountCollection())
      .find(
        { _id: teacherId, active: true },
        { projection: { passwordHash: 0 } },
      )
      .toArray(),
  ]);
  const rows = new Map<string, StudentRow>();
  const get = (id: string) => {
    let row = rows.get(id);
    if (!row) {
      row = {
        id,
        name: "",
        notes: "",
        groupId: null,
        courses: {},
        updatedAt: null,
      };
      rows.set(id, row);
    }
    return row;
  };
  for (const p of people)
    Object.assign(get(p._id), {
      name: p.name,
      notes: p.notes,
      groupId: p.groupId,
      teacherIds: [teacherId],
    });
  for (const p of saved) {
    if (!courses.includes(p.course as Course)) continue;
    const row = get(p.studentId);
    const course = p.course as Course;
    row.courses[course] = p.adminSummary || {
      completed: 0,
      total: catalog[course].length,
      attempted: 0,
      assisted: 0,
      active: "",
      quizzes: [],
    };
    const timestamp =
      p.updatedAt instanceof Date ? p.updatedAt.toISOString() : null;
    if (timestamp && (!row.updatedAt || timestamp > row.updatedAt))
      row.updatedAt = timestamp;
  }
  return {
    students: [...rows.values()].sort((a, b) => a.id.localeCompare(b.id, "mn")),
    groups: classes.map((g) => ({
      id: g._id,
      name: g.name,
      teacherIds: [teacherId],
      grade: g.grade,
    })),
    teachers: teachers.map((t) => ({
      id: t._id,
      name: t.name,
      email: t.email,
      studentCount: people.filter((p) => p.teacherIds?.includes(t._id)).length,
    })),
    truncated: saved.length > 10000 || people.length > 10000,
    fetchedAt: new Date().toISOString(),
  };
}
export async function studentDetail(
  teacherId: string,
  id: unknown,
  course: unknown,
  exerciseId?: string,
) {
  const normalized = studentId(id);
  await requireStudent(normalized, teacherId);
  if (!courses.includes(course as Course))
    throw new InputError("Хичээлээ сонгоно уу.");
  const doc = await (
    await progressCollection()
  ).findOne({ _id: `${course}:${normalized}` });
  return {
    ...detail(
      course as Course,
      parseProgress(doc?.progressJson || "{}"),
      exerciseId,
    ),
    updatedAt: doc?.updatedAt?.toISOString() || null,
  };
}
async function requireStudent(id: string, teacherId: string) {
  const { profiles } = await adminCollections();
  const profile = await profiles.findOne({
    _id: id,
    teacherIds: teacherId,
    sourceId: { $type: "string" },
    deletedAt: { $exists: false },
  });
  if (!profile) throw new AccessError("Энэ сурагчид хандах эрхгүй байна.");
  return profile;
}
export class AccessError extends Error {}
export async function mutate(body: Record<string, unknown>, teacherId: string) {
  const { profiles, groups } = await adminCollections();
  if (body.action === "create-student") {
    const id = studentId(body.studentId);
    if (!/^\d{2}S\d{4}$/.test(id))
      throw new InputError(
        "Сургуулийн ID-гаа 20S0452 хэлбэрээр бичнэ үү (латин S үсэг).",
      );
    const name = string(body.name, 80).normalize("NFKC");
    if (!name) throw new InputError("Сурагчийн нэрийг бичнэ үү.");
    const groupId = string(body.groupId, 64);
    if (
      !groupId ||
      !(await groups.findOne({ _id: groupId, teacherIds: teacherId }))
    )
      throw new AccessError("Зөвхөн өөрийн ангид сурагч нэмэх боломжтой.");
    try {
      await profiles.insertOne({
        _id: id,
        name,
        groupId,
        notes: "",
        sourceId: `manual:${id}`,
        manualEnrollment: true,
        teacherIds: [teacherId],
        updatedAt: new Date(),
      });
    } catch (error) {
      if (
        !error ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== 11000
      )
        throw error;
      const existing = await profiles.findOne({ _id: id });
      // An exact retry is safe; creation never changes an existing student's access or work.
      if (
        existing &&
        !existing.deletedAt &&
        existing.manualEnrollment &&
        existing.sourceId === `manual:${id}` &&
        existing.teacherIds?.includes(teacherId) &&
        existing.name === name &&
        existing.groupId === groupId
      )
        return;
      throw Response.json(
        {
          error:
            "Энэ ID бүртгэлтэй байна. Давхар нэмэхгүйгээр жагсаалтаас шалгах эсвэл сургуулийн админд хандана уу.",
        },
        { status: 409 },
      );
    }
    return;
  }
  if (body.action === "delete" || body.action === "restore") {
    const id = studentId(body.studentId);
    if (body.action === "delete") {
      await requireStudent(id, teacherId);
      await profiles.updateOne(
        { _id: id, teacherIds: teacherId },
        { $set: { deletedAt: new Date(), deletedBy: teacherId } },
      );
    } else {
      const result = await profiles.updateOne(
        { _id: id, teacherIds: teacherId, deletedBy: teacherId },
        { $unset: { deletedAt: "", deletedBy: "" } },
      );
      if (!result.matchedCount)
        throw new AccessError("Энэ сурагчид хандах эрхгүй байна.");
    }
    return;
  }
  if (body.action === "group") {
    const name = string(body.name, 60);
    if (!name) throw new InputError("Ангийн нэрээ бичнэ үү.");
    await groups.createIndex({ key: 1 }, { unique: true });
    const key = name.normalize("NFKC").toLocaleLowerCase("mn");
    if (body.id) {
      const id = string(body.id, 64);
      const existing = await groups.findOne({ _id: id, teacherIds: teacherId });
      if (!existing) throw new AccessError("Энэ ангид хандах эрхгүй байна.");
      if (existing.sourceId)
        throw new InputError(
          "Импортолсон ангийн нэрийг эх жагсаалтаас шинэчилнэ үү.",
        );
      const result = await groups.updateOne(
        { _id: id },
        { $set: { name, key } },
      );
      if (!result.matchedCount) throw new InputError("Анги олдсонгүй.");
    } else {
      if ((await groups.countDocuments()) >= 500)
        throw new InputError("500 хүртэл анги үүсгэх боломжтой.");
      await groups.insertOne({
        _id: randomUUID(),
        name,
        key,
        createdAt: new Date(),
        teacherIds: [teacherId],
      });
    }
    return;
  }
  if (body.action === "profile" || body.action === "assign") {
    const groupId = body.groupId === null ? null : string(body.groupId, 64);
    if (
      groupId !== null &&
      !(await groups.findOne({ _id: groupId, teacherIds: teacherId }))
    )
      throw new InputError("Анги олдсонгүй.");
    if (body.action === "profile") {
      const id = studentId(body.studentId),
        name = string(body.name, 80),
        notes = string(body.notes, 1000);
      await requireStudent(id, teacherId);
      await profiles.updateOne(
        { _id: id, teacherIds: teacherId },
        { $set: { name, notes, groupId, updatedAt: new Date() } },
      );
    } else {
      if (
        !Array.isArray(body.studentIds) ||
        !body.studentIds.length ||
        body.studentIds.length > 500
      )
        throw new InputError("1–500 сурагч сонгоно уу.");
      const ids = [...new Set(body.studentIds.map(studentId))];
      const available = await profiles.countDocuments({
        _id: { $in: ids },
        teacherIds: teacherId,
        sourceId: { $type: "string" },
        deletedAt: { $exists: false },
      });
      if (available !== ids.length)
        throw new AccessError("Зөвхөн өөрийн бүртгэлтэй сурагчдыг сонгоно уу.");
      await profiles.bulkWrite(
        ids.map((_id) => ({
          updateOne: {
            filter: {
              _id,
              teacherIds: teacherId,
              deletedAt: { $exists: false },
            },
            update: {
              $set: { groupId, updatedAt: new Date() },
            },
          },
        })),
      );
    }
    return;
  }
  throw new InputError("Үйлдэл буруу байна.");
}
// Safe to run alongside students: only the summary for the observed revision is updated.
export async function backfillSummaries() {
  const collection = await progressCollection();
  let count = 0;
  for await (const doc of collection
    .find({
      $or: [
        { adminSummary: { $exists: false } },
        { adminSummaryRevision: { $exists: false } },
        { $expr: { $ne: ["$adminSummaryRevision", "$revision"] } },
      ],
    })
    .batchSize(20)) {
    if (!courses.includes(doc.course as Course)) continue;
    const result = await collection.updateOne(
      { _id: doc._id, revision: doc.revision },
      {
        $set: {
          adminSummaryRevision: doc.revision,
          adminSummary: summarize(
            doc.course as Course,
            parseProgress(doc.progressJson),
          ),
        },
      },
    );
    count += result.modifiedCount;
  }
  return count;
}
