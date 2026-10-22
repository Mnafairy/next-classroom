"use client";
import { useState } from "react";
import type { teacherExamDetail } from "@/lib/exam/service";
import { examStatusLabels } from "./ExamResultGroup";
import { dateLabel } from "./api";
import AdminDialog from "./AdminDialog";

export default function ExamAttemptDetail({
  detail,
  onClose,
}: {
  detail: Awaited<ReturnType<typeof teacherExamDetail>>;
  onClose: () => void;
}) {
  const [generation, setGeneration] = useState(
    detail.status === "reset"
      ? (detail.history.at(-1)?.generation ?? detail.generation)
      : detail.generation,
  );
  const previous = detail.history.find((a) => a.generation === generation);
  const [backupId, setBackupId] = useState("");
  const backups = detail.recoveryBackups.filter(
    (b) => b.generation === generation,
  );
  const backup = backups.find((b) => b._id === backupId);
  const answers = backup?.answers || previous?.answers || detail.answers,
    result = backup ? null : previous ? previous.result : detail.result,
    status = previous?.status || detail.status;
  return (
    <AdminDialog
      title={`${detail.name} · ${detail.studentId}`}
      onClose={onClose}
      wide
    >
      <div className="admin-exam-detail">
        <p>
          {detail.className} · {examStatusLabels[status]} · {generation + 1}-р
          оролдлого
        </p>
        {detail.history.length > 0 && (
          <label className="admin-exam-history-label">
            Оролдлого
            <select
              value={generation}
              onChange={(event) => setGeneration(Number(event.target.value))}
            >
              {detail.status !== "reset" && (
                <option value={detail.generation}>
                  {detail.generation + 1}-р оролдлого · Одоогийн
                </option>
              )}
              {[...detail.history].reverse().map((a) => (
                <option key={a.generation} value={a.generation}>
                  {a.generation + 1}-р оролдлого · {a.result?.total ?? "—"}/100
                  · {dateLabel(a.resetAt)}
                </option>
              ))}
            </select>
          </label>
        )}
        {previous && (
          <p>
            Дахин өгөх эрх нээхээс өмнөх хадгалсан ажил ·{" "}
            {dateLabel(previous.resetAt)}
          </p>
        )}
        {backups.length > 0 && (
          <section>
            <h3>Хадгалалтын алдаанаас хамгаалсан ажлууд</h3>
            <p>
              Эдгээр нь татгалзсан хадгалалтын нөөц. Оноог автоматаар
              өөрчлөөгүй.
            </p>
            <label>
              Хариултын хувилбар{" "}
              <select
                value={backupId}
                onChange={(event) => setBackupId(event.target.value)}
              >
                <option value="">Үндсэн хадгалсан хариулт</option>
                {backups.map((b) => (
                  <option key={b._id} value={b._id}>
                    {dateLabel(b.receivedAt)} ·{" "}
                    {Object.keys(b.answers.choices).length}/20 тест ·{" "}
                    {b.reason === "after_finish"
                      ? "Шалгалт дууссаны дараа ирсэн"
                      : "Хадгалалт зөрсөн"}
                  </option>
                ))}
              </select>
            </label>
            {backup && (
              <p role="status">
                Нөөц хариултыг харуулж байна. Хүлээн авсан цаг нь сурагч
                хариулсан цагийг нотлохгүй.
              </p>
            )}
          </section>
        )}
        <h3>Тест · {result?.quizPoints ?? "—"} / 40</h3>
        {detail.questions.map((q, i) => (
          <div key={q.id}>
            <h4>
              {i + 1}. {q.prompt}
            </h4>
            {q.code && <pre>{q.code}</pre>}
            <p>
              Сонгосон: {q.options[answers.choices[q.id]] ?? "Хариулаагүй"}
              {result &&
                ` · ${result.questions.find((r) => r.id === q.id)?.points || 0} / 2 оноо`}
            </p>
          </div>
        ))}
        <h3>Код · {result?.codePoints ?? "—"} / 60</h3>
        {detail.exercises.map((e, i) => {
          const score = result?.exercises.find((r) => r.id === e.id);
          return (
            <div key={e.id}>
              <h4>
                {i + 1}. {e.title}
              </h4>
              <p>{e.prompt}</p>
              <pre>{answers.code[e.id] || "Код бичээгүй"}</pre>
              <p>
                {score
                  ? `${score.points} / 10 оноо · ${score.passed} / ${score.total} шалгалт давсан`
                  : "Энэ оролдлогын оноо гараагүй байна."}
              </p>
            </div>
          );
        })}
      </div>
    </AdminDialog>
  );
}
