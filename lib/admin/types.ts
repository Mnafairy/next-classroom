import type { Course } from "../student/identity";

export type CourseSummary = {
  completed: number;
  total: number;
  attempted: number;
  assisted: number;
  active: string;
  quizzes: { title: string; correct: number; total: number }[];
};
export type Group = {
  id: string;
  name: string;
  grade?: number;
  teacherIds?: string[];
};
export type Teacher = {
  id: string;
  name: string;
  email: string;
  studentCount: number;
};
export type StudentRow = {
  id: string;
  name: string;
  groupId: string | null;
  teacherIds?: string[];
  notes: string;
  updatedAt: string | null;
  courses: Partial<Record<Course, CourseSummary>>;
};
export type Roster = {
  students: StudentRow[];
  groups: Group[];
  teachers: Teacher[];
  truncated: boolean;
  fetchedAt: string;
};
export type StudentDetail = {
  course: Course;
  updatedAt: string | null;
  summary: CourseSummary;
  exercises: {
    id: string;
    title: string;
    status: "complete" | "assisted" | "started" | "empty";
  }[];
  selected: {
    id: string;
    title: string;
    files: Record<string, string>;
    answers: Record<string, string>;
  } | null;
};
