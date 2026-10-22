const TIMEOUT_MESSAGE =
  "Шалгалтын холболт удааширлаа. Интернэтээ шалгаад дахин оролдоно уу. Өмнө эхэлсэн шалгалт байвал хадгалсан ажлаас үргэлжилнэ.";
const CONNECTION_MESSAGE =
  "Шалгалтын сервертэй холбогдсонгүй. Интернэтээ шалгаад дахин оролдоно уу.";

class ExamConnectionError extends Error {}
export class ExamSessionExpiredError extends Error {}
export class ExamRevisionConflictError extends Error {}
export class ExamRecoverySavedError extends Error {}

async function send(body?: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch("/api/exam", {
      method: body ? "POST" : "GET",
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(body?.action === "start" ? 30000 : 15000),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      ["TimeoutError", "AbortError"].includes(error.name)
    )
      throw new ExamConnectionError(TIMEOUT_MESSAGE);
    if (error instanceof TypeError)
      throw new ExamConnectionError(CONNECTION_MESSAGE);
    throw error;
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : CONNECTION_MESSAGE;
    if (
      response.status === 401 ||
      (body &&
        typeof body === "object" &&
        "code" in body &&
        body.code === "exam_reset")
    )
      throw new ExamSessionExpiredError(message);
    if ([502, 503, 504].includes(response.status))
      throw new ExamConnectionError(message);
    if (
      body &&
      typeof body === "object" &&
      "code" in body &&
      body.code === "exam_recovery_saved"
    )
      throw new ExamRecoverySavedError(message);
    if (response.status === 409) throw new ExamRevisionConflictError(message);
    throw new Error(message);
  }
  return response;
}

export async function examFetch(body?: Record<string, unknown>) {
  try {
    return await send(body);
  } catch (error) {
    // Starting is idempotent on the server; saves/submits must not replay a stale revision.
    if (body?.action !== "start" || !(error instanceof ExamConnectionError))
      throw error;
    return send(body);
  }
}
