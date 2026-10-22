import { loadEnvConfig } from "@next/env";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import type { MongoClient } from "mongodb";
import { parseLmsImport } from "../lib/admin/lms-import";
import { classroomDatabase, progressCollection } from "../lib/student/database";
import { adminCollections } from "../lib/admin/data";
import {
  correctionCandidate,
  oneEditAway,
  mergeJavascriptWork,
} from "../lib/admin/reconcile";
import { parseProgress, summarize } from "../lib/admin/progress";
loadEnvConfig(process.cwd());
async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Pass an LMS JSON path");
  const plan = parseLmsImport(JSON.parse(await readFile(path, "utf8")));
  assert.ok(plan.students.length > 0, "Refuse an empty roster cleanup");
  const progress = await progressCollection(),
    { profiles } = await adminCollections();
  const [saved, people] = await Promise.all([
    progress.find({}).toArray(),
    profiles.find({}).toArray(),
  ]);
  const available = [
      ...new Set([
        ...plan.students.map((s) => s.id),
        ...people.filter((p) => p.manualEnrollment === true).map((p) => p._id),
      ]),
    ],
    known = new Set(available);
  const unknown = [
    ...new Set([...saved.map((p) => p.studentId), ...people.map((p) => p._id)]),
  ].filter((id) => !known.has(id));
  const confirmed: Record<string, string> = { "19S067": "19S0267" };
  const report = unknown.map((id) => ({
    id,
    target: confirmed[id] || correctionCandidate(id, available),
    candidates: plan.students
      .filter((s) => oneEditAway(id, s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        class: plan.groups.find((g) => g.sourceId === s.classSourceId)?.name,
      })),
    records: saved.filter((p) => p.studentId === id).length,
  }));
  for (const r of report) if (r.target) assert.ok(known.has(r.target));
  await mkdir("work", { recursive: true });
  await writeFile(
    "work/student-id-review.json",
    JSON.stringify(report, null, 2),
    { mode: 0o600 },
  );
  console.log(
    JSON.stringify({
      unlisted: unknown.length,
      matched: report.filter((r) => r.target).length,
      unresolved: report.filter((r) => !r.target && r.candidates.length).length,
      mode: process.argv.includes("--apply") ? "apply" : "dry-run",
    }),
  );
  if (!process.argv.includes("--apply")) return;
  const backupPath = `work/student-recovery-${Date.now()}.json`;
  // Include canonical targets so every merge can be reversed without losing a draft.
  const affected = new Set([
    ...unknown,
    ...report.flatMap((r) => (r.target ? [r.target] : [])),
  ]);
  await writeFile(
    backupPath,
    JSON.stringify({
      createdAt: new Date(),
      report,
      progress: saved.filter((p) => affected.has(p.studentId)),
      profiles: people.filter((p) => affected.has(p._id)),
    }),
    { mode: 0o600 },
  );
  let recovered = 0,
    removed = 0;
  for (const source of saved.filter((p) => !known.has(p.studentId))) {
    const targetId = report.find((r) => r.id === source.studentId)?.target;
    if (targetId) {
      const targetKey = `${source.course}:${targetId}`;
      let done = false;
      for (let attempt = 0; attempt < 3 && !done; attempt++) {
        const target = await progress.findOne({ _id: targetKey });
        if (!target) {
          try {
            await progress.insertOne({
              ...source,
              _id: targetKey,
              studentId: targetId,
            });
            done = true;
          } catch (error) {
            if (!(
              error &&
              typeof error === "object" &&
              "code" in error &&
              error.code === 11000
            ))
              throw error;
          }
        } else {
          assert.equal(
            source.course,
            "javascript",
            "Only JavaScript work has a defined draft merge",
          );
          const [older, newer] =
            source.updatedAt > target.updatedAt
              ? [target, source]
              : [source, target];
          const merged = mergeJavascriptWork(
            parseProgress(older.progressJson),
            parseProgress(newer.progressJson),
          );
          const revision = target.revision + 1;
          const result = await progress.updateOne(
            { _id: targetKey, revision: target.revision },
            {
              $set: {
                progressJson: JSON.stringify(merged),
                revision,
                updatedAt: newer.updatedAt,
                adminSummary: summarize("javascript", merged),
                adminSummaryRevision: revision,
              },
            },
          );
          done = result.matchedCount === 1;
        }
      }
      assert.ok(done, "Canonical record changed repeatedly; source retained");
      recovered++;
    }
    const result = await progress.deleteOne({
      _id: source._id,
      revision: source.revision,
    });
    assert.equal(
      result.deletedCount,
      1,
      "Source changed; fresh backup is required before cleanup",
    );
    removed++;
  }
  for (const person of people.filter((p) => !known.has(p._id)))
    await profiles.deleteOne({ _id: person._id, updatedAt: person.updatedAt });
  const db = await classroomDatabase();
  console.log(
    JSON.stringify({
      recoveredRecords: recovered,
      removedUnlistedRecords: removed,
      activeProfiles: await profiles.countDocuments(),
      remainingUnlistedRecords: await progress.countDocuments({
        studentId: { $nin: available },
      }),
      backup: backupPath,
      database: db.databaseName,
    }),
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Reconciliation failed",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    const pool = globalThis as typeof globalThis & {
      classroomMongo?: Promise<MongoClient>;
    };
    await (await pool.classroomMongo)?.close();
  });
