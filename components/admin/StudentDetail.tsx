"use client";
import { useEffect, useState } from "react";
import { Check, Code2, Save } from "lucide-react";
import type {
  Group,
  StudentRow,
  StudentDetail as Detail,
} from "@/lib/admin/types";
import { courses, type Course } from "@/lib/student/identity";
import AdminDialog from "./AdminDialog";
import { adminRequest, courseLabels, dateLabel, saveAdmin } from "./api";
const statusLabels = {
  complete: "Дууссан",
  assisted: "Жишээ үзсэн",
  started: "Эхэлсэн",
  empty: "Эхлээгүй",
};
export default function StudentDetail({
  student,
  groups,
  onClose,
  onSaved,
}: {
  student: StudentRow;
  groups: Group[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [name, setName] = useState(student.name),
    [notes, setNotes] = useState(student.notes),
    [groupId, setGroupId] = useState(student.groupId || "");
  const [course, setCourse] = useState<Course>(
      courses.find((course) => student.courses[course]) || "python",
    ),
    [exerciseId, setExerciseId] = useState("");
  const [resource, setResource] = useState<{
    key: string;
    data: Detail | null;
    error: string;
  } | null>(null);
  const [busy, setBusy] = useState(false),
    [saveError, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const resourceKey = `${student.id}:${course}:${exerciseId}`;
  const currentResource = resource?.key === resourceKey ? resource : null;
  const detail = currentResource?.data || null;
  const loading = !currentResource;
  const error = saveError || currentResource?.error || "";
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      studentId: student.id,
      course,
      ...(exerciseId ? { exerciseId } : {}),
    });
    adminRequest<Detail>(`/api/admin/student?${params}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted)
          setResource({ key: resourceKey, data, error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResource({ key: resourceKey, data: null, error: error.message });
      });
    return () => controller.abort();
  }, [student.id, course, exerciseId, resourceKey]);
  return (
    <AdminDialog title={student.name || student.id} onClose={onClose} wide>
      <div className="admin-student-layout">
        <section className="admin-student-profile">
          <span className="admin-student-avatar">{student.id.slice(0, 2)}</span>
          <code>{student.id}</code>
          <p className="admin-muted">
            Сүүлд хадгалсан
            <br />
            <strong>{dateLabel(student.updatedAt)}</strong>
          </p>
          <button
            className="admin-text admin-profile-toggle"
            aria-expanded={profileExpanded}
            aria-controls="student-profile-fields"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            {profileExpanded ? "Мэдээлэл хаах" : "Мэдээлэл засах"}
          </button>
          <div
            id="student-profile-fields"
            className={`admin-profile-fields ${profileExpanded ? "expanded" : ""}`}
          >
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (busy) return;
                setBusy(true);
                setError("");
                try {
                  await saveAdmin({
                    action: "profile",
                    studentId: student.id,
                    name,
                    notes,
                    groupId: groupId || null,
                  });
                  await onSaved();
                  setSaved(true);
                } catch (error) {
                  setError(error instanceof Error ? error.message : "Алдаа");
                } finally {
                  setBusy(false);
                }
              }}
              onChange={() => setSaved(false)}
            >
              <label htmlFor="profile-name">Сурагчийн нэр</label>
              <input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Нэр нэмэх"
              />
              <label htmlFor="profile-group">Анги</label>
              <select
                id="profile-group"
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
              <label htmlFor="profile-notes">Багшийн тэмдэглэл</label>
              <textarea
                id="profile-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Давтах сэдэв, дараагийн алхам…"
              />
              <button className="admin-primary" disabled={busy}>
                {saved ? <Check size={16} /> : <Save size={16} />}
                {busy ? "Хадгалж байна…" : saved ? "Хадгалсан" : "Хадгалах"}
              </button>
            </form>
            <p className="admin-muted">Тэмдэглэл сурагчдад харагдахгүй.</p>
          </div>
        </section>
        <section className="admin-student-work">
          <div className="admin-course-tabs" role="group" aria-label="Хичээл">
            {courses.map((c) => (
              <button
                key={c}
                aria-pressed={course === c}
                onClick={() => {
                  setCourse(c);
                  setExerciseId("");
                }}
              >
                {courseLabels[c]}
                <span>
                  {student.courses[c]
                    ? `${student.courses[c].completed}/${student.courses[c].total}`
                    : "Эхлээгүй"}
                </span>
              </button>
            ))}
          </div>
          <p className="admin-error" role="alert">
            {error}
          </p>
          {loading && (
            <p className="admin-loading" role="status">
              Хадгалсан ажлыг ачаалж байна…
            </p>
          )}
          {detail && (
            <>
              <div className="admin-detail-summary">
                <span>
                  <strong>
                    {detail.summary.completed}/{detail.summary.total}
                  </strong>{" "}
                  дасгал дууссан
                </span>
                <span>{detail.summary.assisted} жишээ үзсэн</span>
                <span>{dateLabel(detail.updatedAt)}</span>
              </div>
              {!!detail.summary.quizzes.length && (
                <div className="admin-quiz-results">
                  <h3>Сорилын үр дүн</h3>
                  {detail.summary.quizzes.map((quiz, index) => (
                    <span key={index}>
                      {quiz.title}
                      <strong>
                        {quiz.correct}/{quiz.total}
                      </strong>
                    </span>
                  ))}
                </div>
              )}
              <div className="admin-work-layout">
                <nav
                  className="admin-exercise-list"
                  aria-label="Сурагчийн дасгалууд"
                >
                  {detail.exercises.map((exercise, index) => (
                    <button
                      key={exercise.id}
                      className={
                        detail.selected?.id === exercise.id ? "selected" : ""
                      }
                      onClick={() => setExerciseId(exercise.id)}
                      aria-current={
                        detail.selected?.id === exercise.id ? "true" : undefined
                      }
                    >
                      <span>{index + 1}</span>
                      <span>
                        {exercise.title}
                        <small className={`status-${exercise.status}`}>
                          {statusLabels[exercise.status]}
                        </small>
                      </span>
                      {exercise.status === "complete" && <Check size={14} />}
                    </button>
                  ))}
                </nav>
                <div className="admin-saved-code">
                  <h3>
                    <Code2 size={17} />
                    {detail.selected?.title}
                  </h3>
                  {detail.selected &&
                    Object.entries(detail.selected.files).map(
                      ([name, code]) => (
                        <div className="admin-code-file" key={name}>
                          <strong>{name}</strong>
                          <pre tabIndex={0}>{code}</pre>
                        </div>
                      ),
                    )}
                  {detail.selected &&
                    !!Object.keys(detail.selected.answers).length && (
                      <div className="admin-saved-answers">
                        <h4>Хадгалсан хариултууд</h4>
                        {Object.entries(detail.selected.answers).map(
                          ([key, value]) => (
                            <p key={key}>
                              <code>{key}</code>
                              <span>{value}</span>
                            </p>
                          ),
                        )}
                      </div>
                    )}
                  {!Object.keys(detail.selected?.files || {}).length &&
                    !Object.keys(detail.selected?.answers || {}).length && (
                      <div className="admin-empty">
                        <Code2 size={25} />
                        <h4>Код хараахан хадгалагдаагүй</h4>
                        <p>
                          Сурагч энэ дасгал дээр ажиллахад хадгалсан код нь энд
                          харагдана.
                        </p>
                      </div>
                    )}
                </div>
              </div>
              <p className="admin-data-note">
                Ахиц нь сурагчийн хадгалсан шалгалтын үр дүн. Кодыг
                ажиллуулахгүйгээр харуулж байна.
              </p>
            </>
          )}
        </section>
      </div>
    </AdminDialog>
  );
}
