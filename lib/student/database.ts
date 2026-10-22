import { MongoClient } from "mongodb";

export type ProgressDocument = {
  _id: string;
  studentId: string;
  course: string;
  progressJson: string;
  revision: number;
  updatedAt: Date;
  adminSummaryRevision?: number;
  adminSummary?: import("../admin/types").CourseSummary;
};
const pool = globalThis as typeof globalThis & {
  classroomMongo?: Promise<MongoClient>;
};
export async function classroomDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Database is not configured");
  if (!pool.classroomMongo) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
    pool.classroomMongo = client.connect().catch(async (error) => {
      pool.classroomMongo = undefined;
      await client.close();
      throw error;
    });
  }
  const client = await pool.classroomMongo;
  return client.db(process.env.MONGODB_DB || "kodlab");
}
export async function progressCollection() {
  return (await classroomDatabase()).collection<ProgressDocument>(
    "student_progress",
  );
}
