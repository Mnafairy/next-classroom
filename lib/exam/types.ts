import type { ExamExercise, ExamQuestion } from "./content";
import type { gradeExam } from "./grading";
import type { ExamAnswers } from "./protocol";

export type ExamResult = ReturnType<typeof gradeExam>;
export type ExamAttempt = {
  _id: string;
  examId: string;
  studentId: string;
  name: string;
  groupId: string;
  className: string;
  startedAt: Date;
  deadline: Date;
  status: "active" | "submitted" | "expired" | "reset";
  generation?: number;
  previousAttempts?: PreviousExamAttempt[];
  answers: ExamAnswers;
  revision: number;
  lastWriterId?: string;
  departures: number;
  lastDepartureAt?: Date;
  submittedAt?: Date;
  result?: ExamResult;
};
export type PreviousExamAttempt = Pick<
  ExamAttempt,
  | "startedAt"
  | "deadline"
  | "status"
  | "generation"
  | "answers"
  | "revision"
  | "departures"
  | "submittedAt"
  | "result"
> & { resetBy: string; resetAt: Date };
export type ExamView = {
  studentId: string;
  name: string;
  className: string;
  status: Exclude<ExamAttempt["status"], "reset">;
  generation: number;
  deadline: string;
  revision: number;
  departures: number;
  answers: ExamAnswers;
  questions: ExamQuestion[];
  exercises: ExamExercise[];
};
export type ExamResponse = { attempt: ExamView | null; serverNow: number };
export type TeacherExamRow = {
  studentId: string;
  name: string;
  className: string;
  grade?: number;
  groupId: string;
  generation: number;
  previousAttempts: number;
  status: "not-started" | ExamAttempt["status"];
  startedAt: string | null;
  submittedAt: string | null;
  departures: number;
  quizPoints: number | null;
  codePoints: number | null;
  total: number | null;
};
export type ExamResetTarget = Pick<TeacherExamRow, "studentId" | "generation">;
export type ClassExamResetResult = {
  ready: string[];
  changed: string[];
  failed: string[];
};
