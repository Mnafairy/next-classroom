import { readJsonObject, sameOrigin } from "@/lib/http/request";
import { mutate, roster } from "@/lib/admin/data";
import { adminError, adminJson, requireAdmin } from "@/lib/admin/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const identity = await requireAdmin(request);
    return adminJson(await roster(identity.id));
  } catch (error) {
    return adminError(error);
  }
}
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return adminJson({ error: "Forbidden" }, 403);
    const identity = await requireAdmin(request);
    await mutate(await readJsonObject(request, 64 * 1024), identity.id);
    return adminJson({ ok: true });
  } catch (error) {
    return adminError(error);
  }
}
