import { readJsonObject, sameOrigin } from "@/lib/http/request";
import { findExercise } from "@/lib/course/lessons";
import { validateSources } from "@/lib/course/validators";
import type { Files } from "@/lib/course/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Use the checker from this app." },
      { status: 403 },
    );
  try {
    const data = await readJsonObject(request, 400000);
    const exercise =
      typeof data.exerciseId === "string"
        ? findExercise(data.exerciseId)
        : undefined;
    const files = data.files as Files | undefined;
    if (
      !exercise ||
      exercise.kind !== "code" ||
      !files ||
      typeof files !== "object" ||
      Array.isArray(files) ||
      Object.keys(files).length !== Object.keys(exercise.starter).length ||
      Object.keys(exercise.starter).some(
        (file) =>
          typeof files?.[file] !== "string" || files[file].length > 30000,
      )
    )
      return Response.json(
        { error: "Choose a code exercise and supply its exercise files." },
        { status: 400 },
      );
    return Response.json(
      { checks: validateSources(exercise, files), runId: data.runId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      {
        error: "The code could not be checked. Review the files and try again.",
      },
      { status: 400 },
    );
  }
}
