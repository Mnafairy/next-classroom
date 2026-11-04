"use client";
import { RotateCcw } from "lucide-react";
import type { TeacherExamRow } from "@/lib/exam/types";
import { dateLabel } from "./api";
export const examStatusLabels = {
  "not-started": "Эхлээгүй",
  active: "Өгч байна",
  submitted: "Илгээсэн",
  expired: "Хугацаа дууссан",
  reset: "Дахин өгөхөд бэлэн",
};
export default function ExamResultGroup({
  name,
  students,
  opening,
  onOpen,
  onReset,
  onSelect,
  onIssue,
}: {
  name: string;
  students: TeacherExamRow[];
  opening: boolean;
  onOpen: (id: string) => void;
  onReset: (student: TeacherExamRow) => void;
  onIssue: (student: TeacherExamRow) => void;
  onSelect?: () => void;
}) {
  const complete = students.filter((s) => s.total !== null);
  return (
    <section
      className="admin-exam-class"
      aria-label={`${name} ангийн шалгалтын дүн`}
    >
      <header>
        <div>
          {onSelect && <h2>{name} анги</h2>}
          <span className="admin-exam-group-summary">
            {students.length} сурагч · {complete.length} үнэлэгдсэн
            {complete.length
              ? ` · Дундаж ${Math.round(complete.reduce((total, s) => total + (s.total || 0), 0) / complete.length)} / 100`
              : ""}
          </span>
        </div>
        {onSelect && (
          <button
            className="admin-text"
            onClick={onSelect}
            aria-label={`${name} анги сонгох`}
          >
            Анги сонгох →
          </button>
        )}
      </header>
      <div className="admin-exam-scroll">
        <table>
          <thead>
            <tr>
              <th>Сурагч</th>
              <th>Төлөв</th>
              <th>Тест /40</th>
              <th>Код /60</th>
              <th>Нийт /100</th>
              <th>Шилжсэн</th>
              <th>Илгээсэн</th>
              <th>Шалгалтын эрх</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.studentId}>
                <td>
                  <button
                    disabled={s.status === "not-started" || opening}
                    onClick={() => onOpen(s.studentId)}
                  >
                    <strong>{s.name}</strong>
                    <small>
                      {s.studentId}
                      {s.generation > 0
                        ? ` · ${s.generation + 1}-р оролдлого`
                        : ""}
                    </small>
                  </button>
                </td>
                <td data-label="Төлөв">
                  <span
                    className={`admin-exam-state admin-exam-state-${s.status}`}
                  >
                    {examStatusLabels[s.status]}
                  </span>
                </td>
                <td data-label="Тест /40">{s.quizPoints ?? "—"}</td>
                <td data-label="Код /60">{s.codePoints ?? "—"}</td>
                <td data-label="Нийт /100" className="admin-exam-score">
                  <strong>{s.total ?? "—"}</strong>
                </td>
                <td data-label="Шилжсэн">{s.departures}</td>
                <td data-label="Илгээсэн">
                  {s.submittedAt ? dateLabel(s.submittedAt) : "—"}
                </td>
                <td className="admin-exam-row-action">
                  <button className="admin-button" onClick={() => onIssue(s)}>
                    Код олгох
                  </button>
                  <button
                    className="admin-button admin-exam-reset-button"
                    disabled={
                      s.status === "not-started" || s.status === "reset"
                    }
                    onClick={() => onReset(s)}
                    aria-label={`${s.studentId} шалгалтыг дахин өгөх эрх нээх`}
                  >
                    <RotateCcw size={15} />
                    Дахин өгөх
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
