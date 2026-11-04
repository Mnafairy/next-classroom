"use client";
import { useState } from "react";
import { EXAM_MINUTES } from "@/lib/exam/content";
import type { TeacherExamRow } from "@/lib/exam/types";
import { adminRequest } from "./api";
import AdminDialog from "./AdminDialog";

export default function ResetExamDialog({
  student,
  onClose,
  onReset,
}: {
  student: TeacherExamRow;
  onClose: () => void;
  onReset: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function reset() {
    setBusy(true);
    setError("");
    try {
      await adminRequest("/api/admin/exam", {
        method: "POST",
        body: JSON.stringify({
          action: "reset",
          studentId: student.studentId,
          generation: student.generation,
        }),
      });
      onReset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Дахин оролдоно уу.");
      setBusy(false);
    }
  }
  return (
    <AdminDialog
      title="Шалгалтыг дахин өгөх үү?"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <div className="admin-exam-reset">
        <p>
          <strong>{student.name}</strong>
          <br />
          {student.studentId} · {student.className}
        </p>
        <p>
          Өмнөх хариулт, код болон оноо түүхэнд хадгалагдана. Одоогийн шалгалтын
          нэвтрэлт хүчингүй болно.
        </p>
        <p>
          Сурагч хуудсаа шинэчлээд ID болон багшийн олгосон кодоор дахин
          нэвтрэхэд шинэ <strong>{EXAM_MINUTES} минут</strong> эхэлнэ.
        </p>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <div className="admin-exam-reset-actions">
          <button className="admin-button" disabled={busy} onClick={onClose}>
            Болих
          </button>
          <button
            className="admin-button admin-primary"
            disabled={busy}
            onClick={() => void reset()}
          >
            {busy ? "Шинэчилж байна…" : "Дахин өгөх эрх нээх"}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}
