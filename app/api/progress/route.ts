import { isRegisteredLearner, teacherIdByName } from "@/lib/student/registry";
import { studentExamActive } from "@/lib/exam/access";
import { summarize } from "@/lib/admin/progress";
import { readJsonObject, sameOrigin } from "@/lib/http/request";
import { progressCollection } from "@/lib/student/database";
import { parseProgressRequest } from "@/lib/student/protocol";

export const runtime = "nodejs";
const MAX_BYTES = 4 * 1024 * 1024;
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function POST(request: Request) {
  // ID-only lesson access for students and teachers; does not create an admin session.
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  let body: ReturnType<typeof parseProgressRequest>;
  try {
    body = parseProgressRequest(await readJsonObject(request, MAX_BYTES));
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "Invalid request" }, 400);
  }
  try {
    if (body.action === "resolve-teacher") {
      const id = await teacherIdByName(body.name);
      return id
        ? json({ id })
        : json({ error: "Teacher name not found or ambiguous" }, 403);
    }
    const { course, studentId } = body;
    if (await studentExamActive(studentId))
      return json(
        {
          code: "exam_active",
          error: "Шалгалт идэвхтэй байна. /exam хуудсанд үргэлжлүүлнэ үү.",
        },
        423,
      );
    if (!(await isRegisteredLearner(studentId)))
      return json(
        {
          code: "student_not_registered",
          error:
            "Сурагчийн ID эсвэл багшийн нэвтрэх нэр бүртгэлгүй эсвэл идэвхгүй байна.",
        },
        403,
      );
    const collection = await progressCollection();
    const _id = `${course}:${studentId}`;
    if (body.action === "load") {
      const doc = await collection.findOne({ _id });
      return json({
        progress: doc ? JSON.parse(doc.progressJson) : null,
        revision: doc?.revision ?? 0,
      });
    }
    const { revision } = body;
    const result = await collection.updateOne(
      { _id, revision },
      {
        $set: {
          studentId,
          course,
          progressJson: JSON.stringify(body.progress),
          updatedAt: new Date(),
          adminSummary: summarize(course, body.progress),
          adminSummaryRevision: revision + 1,
        },
        $inc: { revision: 1 },
      },
      { upsert: revision === 0 },
    );
    if (!result.matchedCount && !result.upsertedCount)
      return json({ error: "Progress changed on another device" }, 409);
    return json({ revision: revision + 1 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    )
      return json({ error: "Progress changed on another device" }, 409);
    // Never expose database credentials or driver errors to students.
    return json({ error: "Progress service unavailable" }, 503);
  }
}
