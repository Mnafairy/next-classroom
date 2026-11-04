export function publicOrigin(request: Request) {
  if (process.env.CLASSROOM_PUBLIC_ORIGIN)
    return new URL(process.env.CLASSROOM_PUBLIC_ORIGIN).origin;
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host && !/[/\\@#?\s]/.test(host))
    return new URL(url.protocol + "//" + host).origin;
  return url.origin;
}

export function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  try {
    return !origin || origin === publicOrigin(request);
  } catch {
    return false;
  }
}

export async function readJsonObject(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw Response.json({ error: "JSON required" }, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) throw Response.json({ error: "Missing body" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw Response.json({ error: "Request too large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Invalid object");
    return body as Record<string, unknown>;
  } finally {
    reader.releaseLock();
  }
}
