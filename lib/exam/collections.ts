import { classroomDatabase } from "../student/database";
import type { ExamAttempt } from "./types";

export async function examCollections() {
  const db = await classroomDatabase();
  return {
    attempts: db.collection<ExamAttempt>("exam_attempts"),
    sessions: db.collection<{
      _id: string;
      attemptId: string;
      generation?: number;
      expiresAt: Date;
      codeHash?: string;
      redeemUntil?: Date;
      sessionHash?: string;
    }>("exam_sessions"),
  };
}
