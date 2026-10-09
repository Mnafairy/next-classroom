import { findExercise } from "@/lib/course/lessons";
import { validateSources } from "@/lib/course/validators";
import type { Files } from "@/lib/course/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host"))
    return Response.json(
      { error: "Use the checker from this app." },
      { status: 403 },
    );
  const body = await request.text();
  if (body.length > 100000)
    return Response.json(
      { error: "Keep each exercise file under 30,000 characters." },
      { status: 413 },
    );
  try {
    const data = JSON.parse(body) as {
      exerciseId?: string;
      files?: Files;
      runId?: string;
    };
    const exercise =
      typeof data.exerciseId === "string"
        ? findExercise(data.exerciseId)
        : undefined;
    if (
      !exercise ||
      exercise.kind !== "code" ||
      !data.files ||
      typeof data.files !== "object" ||
      Object.keys(data.files).length !== Object.keys(exercise.starter).length ||
      Object.keys(exercise.starter).some(
        (file) =>
          typeof data.files?.[file] !== "string" ||
          data.files[file].length > 30000,
      )
    )
      return Response.json(
        { error: "Choose a code exercise and supply its exercise files." },
        { status: 400 },
      );
    return Response.json(
      { checks: validateSources(exercise, data.files), runId: data.runId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error: "The code could not be checked. Review the files and try again.",
      },
      { status: 400 },
    );
  }
}
