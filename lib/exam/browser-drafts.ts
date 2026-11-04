import { EXAM_ID } from "./content";
import { restoreExamDraft } from "./draft";
import { sameExamAnswers } from "./sync";
import type { ActiveExam, ExamView } from "./types";

const legacyKey = (a: ExamView) =>
  `kodlab-exam-draft:${EXAM_ID}:${a.studentId}`;
const key = (a: ExamView) => `${legacyKey(a)}:${a.generation}`;

export function rememberDraft(
  attempt: ActiveExam,
  writer: string,
  raw: string | null,
) {
  const base = key(attempt);
  try {
    if (raw) window.sessionStorage.setItem(base, raw);
    else window.sessionStorage.removeItem(base);
  } catch {
    /* Storage can be disabled. */
  }
  try {
    const owned = `${base}:tab:${writer}`;
    if (raw) localStorage.setItem(owned, raw);
    else localStorage.removeItem(owned);
  } catch {
    /* A quota error must not prevent a server save. */
  }
}
export function tabDraft(attempt: ExamView) {
  try {
    return window.sessionStorage.getItem(key(attempt));
  } catch {
    return null;
  }
}
export function savedDrafts(attempt: ExamView) {
  const base = key(attempt),
    raws = new Set<string>();
  const current = tabDraft(attempt);
  if (current) raws.add(current);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      if (
        !name ||
        !(
          name.startsWith(base + ":tab:") ||
          name === base ||
          (attempt.generation === 0 && name === legacyKey(attempt))
        )
      )
        continue;
      const raw = localStorage.getItem(name);
      if (raw) raws.add(raw);
    }
  } catch {
    /* Browser storage is optional. */
  }
  return [...raws];
}
export function alternateDrafts(attempt: ActiveExam, own: string | null) {
  return savedDrafts(attempt).filter((raw) => {
    if (raw === own) return false;
    const draft = restoreExamDraft(attempt, raw);
    return draft && !sameExamAnswers(draft.answers, attempt.answers);
  });
}
