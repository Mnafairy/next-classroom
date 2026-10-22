"use client";
import { useState } from "react";
import { EXAM_MINUTES } from "@/lib/exam/content";
import type { ClassExamResetResult, ExamResetTarget } from "@/lib/exam/types";
import { adminRequest } from "./api";
import AdminDialog from "./AdminDialog";

export type ClassResetSelection = {
  id: string;
  name: string;
  targets: ExamResetTarget[];
  active: number;
  untouched: number;
};
export default function ResetClassExamDialog({
  selection,
  onClose,
  onReset,
}: {
  selection: ClassResetSelection;
  onClose: () => void;
  onReset: (result: ClassExamResetResult) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function reset() {
    setBusy(true);
    setError("");
    try {
      const result = await adminRequest<ClassExamResetResult>(
        "/api/admin/exam",
        {
          method: "POST",
          body: JSON.stringify({
            action: "reset-class",
            groupId: selection.id,
            targets: selection.targets,
          }),
          signal: AbortSignal.timeout(60000),
        },
      );
      onReset(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Холболтоо шалгаад дахин оролдоно уу.",
      );
      setBusy(false);
    }
  }
  return (
    <AdminDialog
      title={`${selection.name} ангид дахин өгөх эрх нээх үү?`}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="admin-exam-reset">
        <div className="admin-reset-count">
          <strong>{selection.targets.length}</strong>
          <span>танд хуваарилсан сурагчийн оролдлого</span>
        </div>
        <p>
          Өмнөх хариулт, код, оноо түүхэнд хадгалагдана. Сурагч бүр ID-гаар
          дахин нэвтрэхэд шинэ <strong>{EXAM_MINUTES} минут</strong> эхэлнэ.
        </p>
        {selection.active > 0 && (
          <p className="admin-reset-warning">
            <strong>{selection.active} сурагч одоо шалгалт өгч байна.</strong>{" "}
            Тэдний одоогийн оролдлого зогсож, нэвтрэлт хүчингүй болно.
          </p>
        )}
        <p className="admin-reset-scope">
          Энэ ангийн хайлтад харагдаагүй сурагчид мөн хамрагдана. Бусад багшийн
          сурагчид хамрагдахгүй. Эхлээгүй эсвэл дахин өгөхөд бэлэн{" "}
          {selection.untouched} сурагчийн бүртгэл өөрчлөгдөхгүй.
        </p>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <div className="admin-exam-reset-actions">
          <button className="admin-secondary" disabled={busy} onClick={onClose}>
            Болих
          </button>
          <button
            className="admin-primary"
            disabled={busy}
            onClick={() => void reset()}
          >
            {busy
              ? "Эрх нээж байна…"
              : `${selection.targets.length} сурагчид эрх нээх`}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}
