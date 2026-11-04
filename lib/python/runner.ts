import { isolatedWorkerFrame } from "./isolated-worker";
import type { PythonExercise, RunResult } from "./types";

export type RunnerStatus = "idle" | "loading" | "running";
type Pending = {
  id: number;
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
  status: (value: RunnerStatus) => void;
};

export class PythonRunner {
  private frame: HTMLIFrameElement | null = null;
  private handleMessage: ((event: MessageEvent) => void) | null = null;
  private pending: Pending | null = null;
  private nextId = 0;

  private dispose() {
    this.frame?.remove();
    this.frame = null;
    if (this.handleMessage)
      window.removeEventListener("message", this.handleMessage);
    this.handleMessage = null;
  }

  cancel(message = "Ажиллуулалтыг зогсоолоо.") {
    this.dispose();
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
    const frame = isolatedWorkerFrame();
    this.frame = frame;
    const request = {
      id: ++this.nextId,
      mode: exercise ? "check" : "run",
      code,
      inputs: inputs === "" ? [] : inputs.replace(/\r\n/g, "\n").split("\n"),
      tests: exercise?.tests,
      requirements: exercise?.requirements,
    };
    const handleMessage = ({ source, origin, data }: MessageEvent) => {
      if (source !== frame.contentWindow || origin !== "null" || !data) return;
      if (data.ready) {
        frame.contentWindow?.postMessage(request, "*");
        return;
      }
      if (data.failed) {
        this.cancel("Python-ийг ачаалж чадсангүй.");
        return;
      }
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
        this.dispose();
      }
    };
    status("loading");
    return new Promise((resolve) => {
      this.pending = {
        id: request.id,
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
      this.handleMessage = handleMessage;
      window.addEventListener("message", handleMessage);
      document.body.append(frame);
    });
  }
}
