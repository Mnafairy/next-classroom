import { requireAdmin, adminJson, adminError } from "@/lib/admin/http";
import { normalizeStudentId } from "@/lib/student/identity";
import {
  issueExamCode,
  teacherExamDetail,
  teacherExamRows,
  resetStudentExam,
  resetClassExam,
} from "@/lib/exam/service";
import type { ExamResetTarget } from "@/lib/exam/types";
import { InputError } from "@/lib/admin/data";
import { sameOrigin, readJsonObject } from "@/lib/http/request";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const identity = await requireAdmin(request);
    const studentId = new URL(request.url).searchParams.get("studentId");
    return adminJson(
      studentId
        ? await teacherExamDetail(identity.id, normalizeStudentId(studentId))
        : { students: await teacherExamRows(identity.id) },
    );
  } catch (error) {
    return adminError(error);
  }
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Forbidden" }, 403);
    const identity = await requireAdmin(request);
    const body = await readJsonObject(request, 32 * 1024);
    if (body.action === "issue-code") {
      let id: string;
      try {
        id = normalizeStudentId(body.studentId);
      } catch {
        throw new InputError("Сурагчийн ID буруу байна.");
      }
      return adminJson({ code: await issueExamCode(id, identity.id) });
    }
    if (body.action === "reset-class") {
      if (
        typeof body.groupId !== "string" ||
        !body.groupId ||
        body.groupId.length > 100 ||
        !Array.isArray(body.targets) ||
        body.targets.length < 1 ||
        body.targets.length > 200
      )
        throw new InputError("Анги болон сонгосон сурагчдаа шалгана уу.");
      const targets: ExamResetTarget[] = body.targets.map((target: unknown) => {
        if (
          !target ||
          typeof target !== "object" ||
          !("studentId" in target) ||
          !("generation" in target) ||
          typeof target.generation !== "number" ||
          !Number.isSafeInteger(target.generation) ||
          target.generation < 0
        )
          throw new InputError("Шалгалтын оролдлогын мэдээлэл буруу байна.");
        try {
          return {
            studentId: normalizeStudentId(target.studentId),
            generation: target.generation,
          };
        } catch {
          throw new InputError("Сурагчийн ID буруу байна.");
        }
      });
      if (
        new Set(targets.map((target) => target.studentId)).size !==
        targets.length
      )
        throw new InputError("Сурагчийн ID давхардсан байна.");
      return adminJson(
        await resetClassExam(identity.id, body.groupId, targets),
      );
    }
    if (
      body.action !== "reset" ||
      typeof body.generation !== "number" ||
      !Number.isSafeInteger(body.generation) ||
      body.generation < 0
    )
      throw new InputError("Шалгалтын үйлдлээ шалгана уу.");
    let studentId: string;
    try {
      studentId = normalizeStudentId(body.studentId);
    } catch {
      throw new InputError("Сурагчийн ID буруу байна.");
    }
    await resetStudentExam(identity.id, studentId, body.generation);
    return adminJson({ ok: true });
  } catch (error) {
    return adminError(error);
  }
}
