"use client";
import { useState } from "react";
import type { StudentRow } from "@/lib/admin/types";
import AdminDialog from "./AdminDialog";
import { saveAdmin } from "./api";

export default function DeleteStudentDialog({
  student,
  onClose,
  onDeleted,
}: {
  student: StudentRow;
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <AdminDialog
      title="Сурагчийг устгах уу?"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="admin-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await saveAdmin({ action: "delete", studentId: student.id });
            await onDeleted();
          } catch (error) {
            setError(error instanceof Error ? error.message : "Алдаа");
            setBusy(false);
          }
        }}
      >
        <p>
          <strong>{student.name || student.id}</strong> · {student.id}
        </p>
        <p className="admin-muted">
          Сурагчийг жагсаалтаас хасаж, нэвтрэх эрхийг хаана. Хадгалсан ажил
          үлдэх бөгөөд устгасны дараа «Сэргээх» товчоор буцаах боломжтой.
        </p>
        <p className="admin-error" role="alert">
          {error}
        </p>
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-secondary"
            autoFocus
            disabled={busy}
            onClick={onClose}
          >
            Болих
          </button>
          <button type="submit" className="admin-primary" disabled={busy}>
            {busy ? "Устгаж байна…" : "Устгах"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
