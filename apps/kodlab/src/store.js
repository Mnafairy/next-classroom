import { exercises, quizzes, questions } from "./content.js";
import { createCloudProgress, messages } from "../../../lib/student/cloud.ts";
// Active identity stays in memory: every page opening asks who is using the computer.
export const LEGACY_STORAGE_KEY = "kodlab:progress:v1";
export const PROFILE_PREFIX = "kodlab:student:v2:";
export let studentId = "";
export let storageAvailable = true;
export const blank = () => ({
  drafts: {},
  completed: [],
  assisted: [],
  best: {},
  history: [],
  active: "name",
  play: 'let name = "Билгүүн";\nconsole.log("Сайн уу, " + name + "!");',
  attempt: null,
});
export const state = blank();
export let cloudStatus = "";
let cloudActive = false;
const cloud = createCloudProgress("javascript", (status) => {
  cloudStatus = messages[status];
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("kodlab-cloud"));
});
export const recoverCloudProgress = () => cloud.recover();
export async function selectCloudStudent(value) {
  const id = normalizeStudentId(value);
  let local = null;
  try {
    local = JSON.parse(localStorage.getItem(profileKey(id)) || "null");
  } catch {}
  const remote = await cloud.load(id, restore(local));
  studentId = id;
  cloudActive = true;
  replaceState(restore(remote));
  save();
  return id;
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void cloud.flush());
  window.addEventListener("online", () => void cloud.flush());
}
export function normalizeStudentId(value) {
  const id = String(value ?? "")
    .trim()
    .normalize("NFKC")
    .toUpperCase();
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._-]{0,39}$/u.test(id))
    throw new Error(
      "Сурагчийн ID эсвэл багшийн нэрийг 1–40 үсэг, тоо, цэг, - эсвэл _ тэмдэгтээр бичээрэй. Дунд нь зай оруулахгүй.",
    );
  return id;
}
export const profileKey = (id) =>
  PROFILE_PREFIX + encodeURIComponent(normalizeStudentId(id));
const record = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);
const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
function restore(saved) {
  const clean = blank();
  if (!record(saved)) return clean;
  if (exerciseIds.has(saved.active)) clean.active = saved.active;
  if (typeof saved.play === "string") clean.play = saved.play.slice(0, 50000);
  if (record(saved.drafts))
    for (const [id, code] of Object.entries(saved.drafts)) {
      if (exerciseIds.has(id) && typeof code === "string")
        clean.drafts[id] = code.slice(0, 50000);
    }
  for (const field of ["completed", "assisted"]) {
    if (Array.isArray(saved[field]))
      clean[field] = [
        ...new Set(saved[field].filter((id) => exerciseIds.has(id))),
      ];
  }
  clean.completed = clean.completed.filter(
    (id) => !clean.assisted.includes(id),
  );
  if (record(saved.best))
    for (const quiz of quizzes) {
      const score = saved.best[quiz.id];
      if (Number.isFinite(score) && score >= 0 && score <= 100)
        clean.best[quiz.id] = score;
    }
  if (Array.isArray(saved.history))
    clean.history = saved.history
      .filter(
        (item) =>
          record(item) &&
          typeof item.title === "string" &&
          typeof item.date === "string" &&
          Number.isInteger(item.correct) &&
          Number.isInteger(item.total) &&
          item.correct >= 0 &&
          item.correct <= item.total &&
          item.total > 0 &&
          item.total <= questions.length,
      )
      .slice(0, 30);
  const attempt = saved.attempt;
  const quiz =
    record(attempt) && quizzes.find((quiz) => quiz.id === attempt.quiz);
  if (
    quiz &&
    Array.isArray(attempt.ids) &&
    attempt.ids.length > 0 &&
    new Set(attempt.ids).size === attempt.ids.length &&
    attempt.ids.every((id) =>
      questions.some(
        (question) =>
          question.id === id && quiz.topics.includes(question.topic),
      ),
    ) &&
    Number.isInteger(attempt.index) &&
    attempt.index >= 0 &&
    attempt.index < attempt.ids.length &&
    Number.isFinite(attempt.started) &&
    record(attempt.answers)
  ) {
    clean.attempt = {
      ...attempt,
      answers: Object.fromEntries(
        Object.entries(attempt.answers).filter(
          ([id, answer]) =>
            attempt.ids.includes(id) &&
            Number.isInteger(answer) &&
            answer >= 0 &&
            answer <= 3,
        ),
      ),
    };
  }
  return clean;
}
function replaceState(value) {
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, value);
}
export function selectStudent(value) {
  const id = normalizeStudentId(value);
  // Save the previous identity before changing the key; never move its work to another ID.
  if (studentId) save();
  studentId = id;
  storageAvailable = true;
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(profileKey(id)) || "null");
  } catch {
    storageAvailable = false;
  }
  replaceState(restore(saved));
  // Anonymous work from the former shared classroom profile must not be inherited.
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    storageAvailable = false;
  }
  save();
  return id;
}
export function save() {
  if (!studentId) return false;
  if (cloudActive) cloud.save(state);
  try {
    localStorage.setItem(profileKey(studentId), JSON.stringify(state));
    storageAvailable = true;
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}
export function signOutStudent() {
  if (studentId) save();
  cloud.stop();
  cloudActive = false;
  studentId = "";
  replaceState(blank());
}
