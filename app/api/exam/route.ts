import { cookies } from "next/headers";
import { adminError, adminJson } from "@/lib/admin/http";
import { AccessError, InputError } from "@/lib/admin/data";
import { normalizeStudentId } from "@/lib/student/identity";
import { readJsonObject, sameOrigin } from "@/lib/http/request";
import { EXAM_COOKIE, examToken } from "@/lib/exam/access";
import {
  currentAttempt,
  examView,
  startAttempt,
  saveAttempt,
  recordDeparture,
  endExamSession,
} from "@/lib/exam/service";
import { codeCases } from "@/lib/exam/grading";
import { runExamCode } from "@/lib/exam/interpreter";

export const runtime = "nodejs";
function examError(error: unknown) {
  if (!(
    error instanceof Response ||
    error instanceof InputError ||
    error instanceof AccessError
  )) {
    console.error(
      JSON.stringify({
        event: "exam_request_failed",
        name: error instanceof Error ? error.name : "UnknownError",
      }),
    );
  }
  return adminError(error);
}
export async function GET(request: Request) {
  try {
    const a = await currentAttempt(examToken(request));
    return adminJson({
      attempt: a ? examView(a) : null,
      serverNow: Date.now(),
    });
  } catch (error) {
    return examError(error);
  }
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Forbidden" }, 403);
    const body = await readJsonObject(request, 192 * 1024);
    if (body.action === "start") {
      let id: string;
      try {
        id = normalizeStudentId(body.studentId);
      } catch {
        throw new InputError("Сурагчийн ID-гаа зөв оруулна уу.");
      }
      const next = await startAttempt(id, examToken(request));
      (await cookies()).set(EXAM_COOKIE, next.token, {
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 3600,
      });
      return adminJson({
        attempt: examView(next.attempt),
        serverNow: Date.now(),
      });
    }
    const attempt = await currentAttempt(examToken(request));
    if (body.action === "next-student" && !attempt) {
      (await cookies()).delete(EXAM_COOKIE);
      return adminJson({ attempt: null, serverNow: Date.now() });
    }
    if (!attempt)
      return adminJson(
        {
          error:
            "Шалгалтын нэвтрэлт дууссан эсвэл багш шинэчилсэн байна. ID-гаар дахин нэвтэрнэ үү.",
        },
        401,
      );
    if (
      body.studentId !== attempt.studentId ||
      body.generation !== (attempt.generation || 0)
    )
      return adminJson(
        {
          code: "exam_reset",
          error:
            "Энэ цонхны сурагчийн нэвтрэлт өөрчлөгдсөн. Шалгалтын хуудсаа дахин нээнэ үү.",
        },
        409,
      );
    if (body.action === "next-student") {
      await endExamSession(examToken(request));
      (await cookies()).delete(EXAM_COOKIE);
      return adminJson({ attempt: null, serverNow: Date.now() });
    }
    if (body.action === "save" || body.action === "submit") {
      const next = await saveAttempt(attempt, body, body.action === "submit");
      return adminJson({ attempt: examView(next), serverNow: Date.now() });
    }
    if (body.action === "departure") {
      await recordDeparture(attempt);
      return adminJson({ ok: true });
    }
    if (body.action === "sample") {
      if (attempt.status !== "active")
        return adminJson({ error: "Шалгалтын хугацаа дууссан." }, 409);
      if (
        typeof body.exerciseId !== "string" ||
        !Object.hasOwn(codeCases, body.exerciseId) ||
        typeof body.code !== "string" ||
        body.code.length > 12000
      )
        throw new InputError("Дасгал болон кодоо шалгана уу.");
      try {
        return adminJson({
          output: runExamCode(body.code, codeCases[body.exerciseId][0].inputs),
        });
      } catch (error) {
        return adminJson(
          {
            error: error instanceof Error ? error.message : "Кодоо шалгана уу.",
          },
          400,
        );
      }
    }
    throw new InputError("Үйлдэл буруу байна.");
  } catch (error) {
    return examError(error);
  }
}
