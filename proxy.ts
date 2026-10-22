import { NextRequest, NextResponse } from "next/server";
import { cookieAttempt, EXAM_COOKIE } from "./lib/exam/access";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path === "/exam" ||
    path.startsWith("/exam/") ||
    path === "/api/exam" ||
    path.startsWith("/_next/") ||
    path === "/exam-guard.js"
  )
    return NextResponse.next();
  const token = request.cookies.get(EXAM_COOKIE)?.value;
  if (!token) return NextResponse.next();
  try {
    const a = await cookieAttempt(token);
    if (!a || a.status !== "active" || a.deadline.getTime() <= Date.now())
      return NextResponse.next();
    if (path.startsWith("/api/"))
      return NextResponse.json(
        {
          code: "exam_active",
          error: "Шалгалт идэвхтэй байна. Шалгалтын хуудсандаа буцна уу.",
        },
        { status: 423, headers: { "Cache-Control": "private, no-store" } },
      );
    const response = NextResponse.redirect(new URL("/exam", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    // Keep the student at the exam if its lock cannot be verified.
    return path.startsWith("/api/")
      ? NextResponse.json(
          { error: "Шалгалтын холболтыг шалгана уу." },
          { status: 503 },
        )
      : NextResponse.redirect(new URL("/exam", request.url));
  }
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
