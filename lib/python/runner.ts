import type { PythonExercise, RunResult } from "./types";

export type RunnerStatus = "idle" | "loading" | "running";
type Pending = {
  id: number;
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
  status: (value: RunnerStatus) => void;
};

export class PythonRunner {
  private worker: Worker | null = null;
  private pending: Pending | null = null;
  private nextId = 0;

  cancel(message = "Ажиллуулалтыг зогсоолоо.") {
    this.worker?.terminate();
    this.worker = null;
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.status("idle");
      this.pending.resolve({ output: "", error: message, checks: [] });
      this.pending = null;
    }
  }

  run(
    code: string,
    inputs: string,
    exercise: PythonExercise | undefined,
    status: (value: RunnerStatus) => void,
  ): Promise<RunResult> {
    if (this.pending) this.cancel();
    if (!this.worker) {
      this.worker = new Worker("/python/worker.js");
      this.worker.onmessage = ({ data }) => {
        const pending = this.pending;
        if (!pending || data.id !== pending.id) return;
        if (data.status === "loading") pending.status("loading");
        if (data.status === "running") {
          pending.status("running");
          clearTimeout(pending.timer);
          pending.timer = setTimeout(
            () =>
              this.cancel(
                "Хугацаа хэтэрлээ. Давталтын нөхцөл болон тоолуураа шалгаарай.",
              ),
            6000,
          );
        }
        if (data.result) {
          clearTimeout(pending.timer);
          pending.status("idle");
          this.pending = null;
          pending.resolve(data.result);
          // Each request gets fresh Python state, including builtins and imported modules.
          this.worker?.terminate();
          this.worker = null;
        }
      };
      this.worker.onerror = () =>
        this.cancel(
          "Python-ийг ачаалж чадсангүй. Хуудсаа шинэчлээд дахин оролдоорой.",
        );
    }
    status("loading");
    return new Promise((resolve) => {
      const id = ++this.nextId;
      this.pending = {
        id,
        resolve,
        status,
        timer: setTimeout(
          () =>
            this.cancel(
              "Python ачаалах хугацаа хэтэрлээ. Холболтоо шалгаад дахин оролдоорой.",
            ),
          45000,
        ),
      };
      this.worker!.postMessage({
        id,
        mode: exercise ? "check" : "run",
        code,
        inputs: inputs === "" ? [] : inputs.replace(/\r\n/g, "\n").split("\n"),
        tests: exercise?.tests,
        requirements: exercise?.requirements,
      });
    });
  }
}
