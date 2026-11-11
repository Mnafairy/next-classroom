import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  adminConfigured,
  allowLogin,
  createAdminSession,
  endAdminSession,
  requestToken,
  authenticateAdmin,
  hashPassword,
} from "@/lib/admin/auth";
import { accountCollection } from "@/lib/admin/accounts";
import { adminError, adminJson } from "@/lib/admin/http";
import { publicOrigin, readJsonObject, sameOrigin } from "@/lib/http/request";
export const runtime = "nodejs";
function cookieResponse(request: Request, token: string, maxAge: number) {
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: publicOrigin(request).startsWith("https://"),
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return response;
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Forbidden" }, 403);
    if (!(await adminConfigured()))
      return adminJson({ error: "Админ нууц үг тохируулагдаагүй байна." }, 503);
    const body = await readJsonObject(request, 4096);
    if (!(await allowLogin(request)))
      return adminJson(
        { error: "Олон удаа оролдлоо. 15 минутын дараа дахин оролдоорой." },
        429,
      );
    let account = await authenticateAdmin(body.username, body.password);
    if (!account)
      return adminJson(
        { error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." },
        401,
      );
    if (account.setupRequired) {
      if (body.newPassword === undefined)
        return adminJson({ setupRequired: true });
      const password = body.newPassword;
      if (
        typeof password !== "string" ||
        password.length < 12 ||
        password.length > 1024 ||
        password === body.password ||
        password.toLowerCase() === account.email
      )
        return adminJson(
          {
            error:
              "Шинэ нууц үг 12–1024 тэмдэгттэй, имэйл болон түр нууц үгээс өөр байна.",
          },
          400,
        );
      account = await (
        await accountCollection()
      ).findOneAndUpdate(
        {
          _id: account._id,
          active: true,
          setupRequired: true,
          passwordHash: account.passwordHash,
        },
        {
          $set: { passwordHash: await hashPassword(password) },
          $unset: { setupRequired: "" },
        },
        { returnDocument: "after" },
      );
      if (!account)
        return adminJson(
          { error: "Нууц үг шинэчлэгдсэн. Шинэ нууц үгээрээ нэвтэрнэ үү." },
          401,
        );
    }
    // Revoke the previous browser session when signing in again.
    await endAdminSession(requestToken(request));
    return cookieResponse(
      request,
      await createAdminSession(account),
      SESSION_SECONDS,
    );
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Forbidden" }, 403);
    await endAdminSession(requestToken(request));
    return cookieResponse(request, "", 0);
  } catch (error) {
    return adminError(error);
  }
}
