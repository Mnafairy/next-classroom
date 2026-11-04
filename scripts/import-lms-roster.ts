import { loadEnvConfig } from "@next/env";
import {
  readFile,
  writeFile,
  mkdir,
  chmod,
  appendFile,
} from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { classroomDatabase } from "../lib/student/database";
import { parseLmsImport, applyLmsImport } from "../lib/admin/lms-import";
import type { MongoClient } from "mongodb";
loadEnvConfig(process.cwd());
async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Pass an LMS JSON path");
  const plan = parseLmsImport(JSON.parse(await readFile(path, "utf8")));
  console.log(
    JSON.stringify({
      teachers: plan.teachers.length,
      classes: plan.groups.length,
      students: plan.students.length,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    }),
  );
  if (!process.argv.includes("--apply")) return;
  try {
    const db = await classroomDatabase();
    await mkdir("work", { recursive: true });
    const backup = {
      student_profiles: await db
        .collection("student_profiles")
        .find({})
        .toArray(),
      student_groups: await db.collection("student_groups").find({}).toArray(),
      admin_accounts: await db.collection("admin_accounts").find({}).toArray(),
    };
    const backupPath = `work/lms-before-${Date.now()}.json`;
    await writeFile(backupPath, JSON.stringify(backup), { mode: 0o600 });
    const setupPath = `work/admin-setup-${randomBytes(12).toString("hex")}.txt`;
    await writeFile(setupPath, "Private one-time teacher setup codes\n", {
      mode: 0o600,
      flag: "wx",
    });
    console.log("Private setup codes: " + setupPath);
    console.log(
      JSON.stringify(
        await applyLmsImport(plan, (id, secret) =>
          appendFile(setupPath, `${id}\t${secret}\n`),
        ),
      ),
    );
    const key =
      process.env.ADMIN_RATE_LIMIT_KEY || randomBytes(32).toString("hex");
    const envPath = ".env.local";
    let env = await readFile(envPath, "utf8");
    env = env
      .replace(/^ADMIN_PASSWORD_HASH=.*\n?/gm, "")
      .replace(/^ADMIN_RATE_LIMIT_KEY=.*\n?/gm, "");
    await writeFile(
      envPath,
      env.trimEnd() + `\nADMIN_RATE_LIMIT_KEY=${key}\n`,
      { mode: 0o600 },
    );
    await chmod(envPath, 0o600);
    await writeFile("work/admin-rate-limit-key.txt", key, { mode: 0o600 });
    await chmod("work/admin-rate-limit-key.txt", 0o600);
  } finally {
    const pool = globalThis as typeof globalThis & {
      classroomMongo?: Promise<MongoClient>;
    };
    await (await pool.classroomMongo)?.close();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "LMS import failed");
  process.exitCode = 1;
});
