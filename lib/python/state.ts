import {
  emptyProgress,
  normalizeStudent,
  restoreProgress,
  storageKey,
  validStudent,
} from "./storage";
import type { StudentProgress } from "./types";
import { createCloudProgress, messages } from "../student/cloud";

type State = {
  ready: boolean;
  student: string | null;
  progress: StudentProgress;
  saving: boolean;
  cloudStatus: string;
};
const server: State = {
  ready: false,
  student: null,
  progress: emptyProgress(),
  saving: true,
  cloudStatus: "",
};
let state = server;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const cloud = createCloudProgress("python", (status) => {
  state = { ...state, cloudStatus: messages[status] };
  emit();
});
export const recoverCloudProgress = () => cloud.recover();
export const getState = () => state;
export const getServerState = () => server;
export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!state.ready) {
    state = { ...state, ready: true };
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
}
export async function login(value: string) {
  const student = normalizeStudent(value);
  if (!validStudent(student))
    throw new Error("2–40 үсэг, тоо, цэг, зураас эсвэл доогуур зураас ашиглаарай.");
  let local = emptyProgress();
  try {
    local = restoreProgress(localStorage.getItem(storageKey(student)));
  } catch {
    /* optional cache */
  }
  const remote = await cloud.load(student, local);
  state = {
    ...state,
    ready: true,
    student,
    progress: restoreProgress(JSON.stringify(remote)),
    saving: true,
  };
  emit();
  return true;
}
export function logout() {
  cloud.stop();
  state = {
    ...state,
    student: null,
    progress: emptyProgress(),
    cloudStatus: "",
  };
  emit();
}
export function updateProgress(
  change: (progress: StudentProgress) => StudentProgress,
) {
  if (!state.student) return;
  const progress = change(state.progress);
  let saving = true;
  try {
    localStorage.setItem(storageKey(state.student), JSON.stringify(progress));
  } catch {
    saving = false;
  }
  state = { ...state, progress, saving };
  cloud.save(progress);
  emit();
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void cloud.flush());
  window.addEventListener("online", () => void cloud.flush());
}
