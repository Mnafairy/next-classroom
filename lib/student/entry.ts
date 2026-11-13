import { messages } from "./cloud";
import { normalizeStudentId, normalizeTeacherName } from "./identity";

export async function enterLesson(
  value: string,
  login: (id: string) => Promise<unknown>,
) {
  const name = normalizeTeacherName(value);
  if (!name) return login(value);

  if (/^\p{L}[\p{L}.-]{1,39}$/u.test(name)) {
    try {
      return await login(value);
    } catch (error) {
      if (!(
        error instanceof Error &&
        "status" in error &&
        error.status === 403
      ))
        throw error;
    }
  }

  const response = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resolve-teacher", name }),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 403)
    throw new Error(
      "Багшийн нэр олдсонгүй эсвэл давхцаж байна. Бүтэн нэрээ шалгах эсвэл нэвтрэх нэрээ ашиглаарай.",
    );
  if (!response.ok) throw new Error(messages.offline);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("id" in result))
    throw new Error(messages.offline);
  return login(normalizeStudentId(result.id));
}
