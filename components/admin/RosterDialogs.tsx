"use client";
import { useState } from "react";
import type { Group } from "@/lib/admin/types";
import AdminDialog from "./AdminDialog";
import { saveAdmin } from "./api";

export function GroupEditor({
  group,
  onClose,
  onSaved,
}: {
  group: Group | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(group?.name || ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <AdminDialog
      title={group ? "Ангийн нэр засах" : "Шинэ анги"}
      onClose={onClose}
    >
      <form
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await saveAdmin({ action: "group", id: group?.id, name });
            await onSaved();
          } catch (error) {
            setError(error instanceof Error ? error.message : "Алдаа");
            setBusy(false);
          }
        }}
      >
        <label htmlFor="group-name">Ангийн нэр</label>
        <input
          id="group-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          placeholder="Жишээ: 10A"
        />
        <p className="admin-error" role="alert">
          {error}
        </p>
        <div className="admin-form-actions">
          <button type="button" className="admin-secondary" onClick={onClose}>
            Болих
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Хадгалж байна…" : "Хадгалах"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
export function AddStudents({
  groups,
  defaultGroup,
  onClose,
  onSaved,
}: {
  groups: Group[];
  defaultGroup: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [ids, setIds] = useState(""),
    [groupId, setGroupId] = useState(defaultGroup),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <AdminDialog title="ID-гаар хуваарилах" onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await saveAdmin({
              action: "assign",
              studentIds: ids.split(/[\s,]+/u).filter(Boolean),
              groupId: groupId || null,
            });
            await onSaved();
          } catch (error) {
            setError(error instanceof Error ? error.message : "Алдаа");
            setBusy(false);
          }
        }}
      >
        <label htmlFor="add-ids">Сурагчийн ID-нууд</label>
        <textarea
          id="add-ids"
          autoFocus
          required
          rows={6}
          value={ids}
          onChange={(e) => setIds(e.target.value)}
          maxLength={25000}
          placeholder="Сургуулийн жагсаалт дахь сурагчийн ID"
        />
        <p className="admin-muted">
          Зөвхөн таны бүртгэлтэй сурагчдын ID-г бичнэ үү. Нэг мөрөнд нэг ID.
        </p>
        <label htmlFor="add-group">Анги</label>
        <select
          id="add-group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Анги оноогоогүй</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="admin-error" role="alert">
          {error}
        </p>
        <div className="admin-form-actions">
          <button type="button" className="admin-secondary" onClick={onClose}>
            Болих
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Хадгалж байна…" : "ID-гаар хуваарилах"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
