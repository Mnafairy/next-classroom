import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { MongoClient } from "mongodb";
import { POST } from "../../app/api/progress/route";

test(
  "real MongoDB: save/reload, course/student isolation, stale writes and concurrent first saves",
  { skip: !process.env.MONGODB_TEST_BINARY },
  async () => {
    const server = createServer();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const port = (server.address() as { port: number }).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const directory = await mkdtemp(join(tmpdir(), "kodlab-mongo-test-"));
    const proc = spawn(
      process.env.MONGODB_TEST_BINARY!,
      [
        "--dbpath",
        directory,
        "--port",
        String(port),
        "--bind_ip",
        "127.0.0.1",
        "--quiet",
      ],
      { stdio: "ignore" },
    );
    const uri = `mongodb://127.0.0.1:${port}`;
    const previous = process.env.MONGODB_URI;
    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB = "kodlab_test";
    const probe = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    const call = async (
      action: string,
      studentId = "001",
      course = "python",
      revision = 0,
      progress = {},
    ) => {
      const response = await POST(
        new Request("http://localhost/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            studentId,
            course,
            revision,
            progress,
          }),
        }),
      );
      return { status: response.status, data: await response.json() };
    };
    try {
      await probe.connect();
      const db = probe.db("kodlab_test");
      await db
        .collection("student_profiles")
        .insertMany(
          ["001", "002", "003"].map((id) => ({
            _id: id as never,
            sourceId: "source-" + id,
          })),
        );
      for (const id of ["1", "12", "UNKNOWN"])
        for (const course of ["python", "javascript", "nextjs"]) {
          assert.equal((await call("load", id, course)).status, 403);
          assert.equal((await call("save", id, course)).status, 403);
        }
      assert.equal(await db.collection("student_progress").countDocuments(), 0);
      assert.equal((await call("load")).data.progress, null);
      const progress = {
        completed: ["exercise-1"],
        drafts: { "exercise-1": { code: "print(42)" } },
        quizAttempts: { all: { answers: { q1: 2 } } },
      };
      assert.equal(
        (await call("save", "001", "python", 0, progress)).status,
        200,
      );
      assert.deepEqual((await call("load")).data.progress, progress);
      assert.equal((await call("load", "002")).data.progress, null);
      assert.equal(
        (await call("load", "001", "javascript")).data.progress,
        null,
      );
      assert.equal((await call("save", "001", "python", 0, {})).status, 409);
      assert.equal(
        (await call("save", "001", "python", 1, { completed: [] })).status,
        200,
      );
      assert.equal(
        (await call("save", "001", "python", 1, progress)).status,
        409,
      );
      const race = await Promise.all([
        call("save", "003"),
        call("save", "003"),
      ]);
      assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
      await db
        .collection("student_profiles")
        .updateOne(
          { _id: "001" as never },
          { $set: { deletedAt: new Date() } },
        );
      assert.equal((await call("load")).status, 403);
      assert.equal((await call("save", "001", "python", 2)).status, 403);
      assert.equal(
        await db
          .collection("student_progress")
          .countDocuments({ studentId: "001" }),
        1,
      );
    } finally {
      await probe.close();
      const globalPool = globalThis as typeof globalThis & {
        classroomMongo?: Promise<MongoClient>;
      };
      await (await globalPool.classroomMongo)?.close();
      delete globalPool.classroomMongo;
      if (previous === undefined) delete process.env.MONGODB_URI;
      else process.env.MONGODB_URI = previous;
      const stopped = new Promise((resolve) => proc.once("exit", resolve));
      proc.kill("SIGTERM");
      await stopped;
      await rm(directory, { recursive: true, force: true });
    }
  },
);
