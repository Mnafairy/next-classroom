import { createHash } from "node:crypto";
import { examCollections } from "./collections";
import { EXAM_ID } from "./content";

export const EXAM_COOKIE = "kodlab-exam";
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function examToken(request: Request) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${EXAM_COOKIE}=`))
    ?.slice(EXAM_COOKIE.length + 1);
}
export async function cookieAttempt(token?: string) {
  if (!token || !/^[\w-]{43}$/.test(token)) return null;
  const { sessions, attempts } = await examCollections();
  const session = await sessions.findOne({
    _id: tokenHash(token),
    expiresAt: { $gt: new Date() },
  });
  const attempt = session
    ? await attempts.findOne(
        { _id: session.attemptId },
        { projection: { previousAttempts: 0 } },
      )
    : null;
  return attempt &&
    attempt.status !== "reset" &&
    (attempt.generation || 0) === (session?.generation || 0)
    ? attempt
    : null;
}
export async function studentExamActive(studentId: string) {
  return !!(await (
    await examCollections()
  ).attempts.findOne(
    {
      _id: `${EXAM_ID}:${studentId}`,
      status: "active",
      deadline: { $gt: new Date() },
    },
    { projection: { _id: 1 } },
  ));
}
