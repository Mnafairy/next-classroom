import { loadEnvConfig } from "@next/env";
import type { MongoClient } from "mongodb";
import { backfillSummaries } from "../lib/admin/data";
loadEnvConfig(process.cwd());
async function main() {
  try {
    console.log(
      `Prepared admin summaries for ${await backfillSummaries()} existing course records.`,
    );
  } finally {
    const pool = globalThis as typeof globalThis & {
      classroomMongo?: Promise<MongoClient>;
    };
    await (await pool.classroomMongo)?.close();
  }
}
main().catch(() => {
  console.error("Summary preparation failed. Student progress was not reset.");
  process.exitCode = 1;
});
