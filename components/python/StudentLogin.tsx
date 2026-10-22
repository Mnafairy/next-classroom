"use client";
import CourseEntry from "@/components/student/CourseEntry";
import { login } from "@/lib/python/state";
export default function StudentLogin() {
  return <CourseEntry course="python" onLogin={login} />;
}
