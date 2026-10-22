"use client";
import { useState } from "react";
import LearningWorkspace from "@/components/learning/LearningWorkspace";
import { loginStudent, logoutStudent } from "@/lib/course/progress";
import CourseEntry from "./CourseEntry";
export default function NextStudentGate() {
  const [student, setStudent] = useState("");
  if (student)
    return (
      <LearningWorkspace
        key={student}
        student={student}
        onSwitchStudent={() => {
          logoutStudent();
          setStudent("");
        }}
      />
    );
  return (
    <CourseEntry
      course="nextjs"
      onLogin={async (id) => setStudent(await loginStudent(id))}
    />
  );
}
