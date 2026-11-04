"use client";
import { useState } from "react";
import type { TeacherExamRow } from "@/lib/exam/types";
import AdminDialog from "./AdminDialog";
import { adminRequest } from "./api";

export default function ExamCodeDialog({
  student,
  onClose,
}: {
  student: TeacherExamRow;
  onClose: () => void;
}) {
  const [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function issue() {
    setBusy(true);
    setError("");
    try {
      const result = await adminRequest<{ code: string }>("/api/admin/exam", {
        method: "POST",
        body: JSON.stringify({
          action: "issue-code",
          studentId: student.studentId,
        }),
      });
      setCode(result.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Код олгож чадсангүй.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AdminDialog
      title="Шалгалтад нэвтрэх код"
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
        {code ? (
          <>
            <label>
              Нэг удаагийн код{" "}
              <input
                readOnly
                value={code}
                onFocus={(event) => event.target.select()}
              />
            </label>
            <p>
              Код 30 минут хүчинтэй. Зөвхөн энэ сурагчид хувиараа дамжуулна уу.
            </p>
          </>
        ) : (
          <p>
            Шинэ код олгоход өмнөх код болон тухайн сурагчийн хөтчийн нэвтрэлт
            хүчингүй болно. Хадгалсан хариулт, хугацаа хэвээр үлдэнэ.
          </p>
        )}
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <div className="admin-exam-reset-actions">
          <button className="admin-button" disabled={busy} onClick={onClose}>
            Хаах
          </button>
          {!code && (
            <button className="admin-primary" disabled={busy} onClick={issue}>
              Код олгох
            </button>
          )}
        </div>
      </div>
    </AdminDialog>
  );
}
