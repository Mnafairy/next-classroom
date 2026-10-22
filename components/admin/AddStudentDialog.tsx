"use client";
import { useRef, useState } from "react";
import type { Group } from "@/lib/admin/types";
import { normalizeStudentId } from "@/lib/student/identity";
import AdminDialog from "./AdminDialog";
import { saveAdmin } from "./api";

export default function AddStudentDialog({
  groups,
  defaultGroup,
  onClose,
  onSaved,
}: {
  groups: Group[];
  defaultGroup: string;
  onClose: () => void;
  onSaved: (student: {
    id: string;
    name: string;
    groupId: string;
  }) => Promise<void>;
}) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState(
    defaultGroup || (groups.length === 1 ? groups[0].id : ""),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  return (
    <AdminDialog
      title="Сурагч нэмэх"
      onClose={() => {
        if (!submitting.current) onClose();
      }}
    >
      <form
        className="admin-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitting.current) return;
          submitting.current = true;
          setBusy(true);
          setError("");
          try {
            const studentId = normalizeStudentId(id);
            if (!/^\d{2}S\d{4}$/.test(studentId))
              throw new Error(
                "Сургуулийн ID-гаа 20S0452 хэлбэрээр бичнэ үү (латин S үсэг).",
              );
            const studentName = name.trim().normalize("NFKC");
            if (!studentName) throw new Error("Сурагчийн нэрийг бичнэ үү.");
            await saveAdmin({
              action: "create-student",
              studentId,
              name: studentName,
              groupId,
            });
            await onSaved({ id: studentId, name: studentName, groupId });
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Дахин оролдоно уу.",
            );
          } finally {
            submitting.current = false;
            setBusy(false);
          }
        }}
      >
        <p className="admin-muted">
          Сурагч өөрийн ID-гаар хичээл болон ангийнхаа шалгалтад нэвтэрнэ.
        </p>
        <label htmlFor="new-student-id">Сурагчийн ID</label>
        <input
          id="new-student-id"
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={id}
          onChange={(event) => setId(event.target.value)}
          placeholder="20S0452"
          maxLength={40}
          required
          disabled={busy}
          aria-describedby="new-student-id-help"
        />
        <small id="new-student-id-help" className="admin-muted">
          Жижиг, том үсэг ялгаагүй. Жишээ: 20s0452.
        </small>
        <label htmlFor="new-student-name">Сурагчийн нэр</label>
        <input
          id="new-student-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="М.Ананд"
          maxLength={80}
          required
          disabled={busy}
        />
        <label htmlFor="new-student-group">Анги</label>
        <select
          id="new-student-group"
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          required
          disabled={busy || !groups.length}
        >
          <option value="" disabled>
            Анги сонгох
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <p className="admin-muted">
          {groups.length
            ? "Зөвхөн танд хуваарилсан ангиуд харагдана."
            : "Танд анги хуваарилаагүй байна. Сургуулийн админд хандана уу."}
        </p>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Болих
          </button>
          <button
            className="admin-primary"
            disabled={busy || !groupId || !id.trim() || !name.trim()}
          >
            {busy ? "Нэмж байна…" : "Сурагч нэмэх"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
