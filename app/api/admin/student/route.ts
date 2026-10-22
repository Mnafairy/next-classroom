import { studentDetail } from "@/lib/admin/data";
import { adminError, adminJson, requireAdmin } from "@/lib/admin/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const identity = await requireAdmin(request);
    const params = new URL(request.url).searchParams;
    return adminJson(
      await studentDetail(
        identity.id,
        params.get("studentId"),
        params.get("course"),
        params.get("exerciseId") || undefined,
      ),
    );
  } catch (error) {
    return adminError(error);
  }
}
