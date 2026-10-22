import { getAdminIdentity, requestToken } from "./auth";
import { AccessError, InputError } from "./data";
export const adminJson = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
  });
export async function requireAdmin(request: Request) {
  const identity = await getAdminIdentity(requestToken(request));
  if (!identity) throw adminJson({ error: "Нэвтрэх эрх шаардлагатай." }, 401);
  return identity;
}
export function adminError(error: unknown) {
  if (error instanceof Response) {
    error.headers.set("Cache-Control", "private, no-store");
    return error;
  }
  if (error instanceof AccessError)
    return adminJson({ error: error.message }, 403);
  if (error instanceof InputError)
    return adminJson({ error: error.message }, 400);
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  )
    return adminJson({ error: "Ийм нэртэй анги байна." }, 409);
  return adminJson({ error: "Холболт тасарлаа. Дахин оролдоно уу." }, 503);
}
