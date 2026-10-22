import type { Metadata } from "next";
import NextStudentGate from "@/components/student/NextStudentGate";

export const metadata: Metadata = {
  title: "Next Classroom",
  description: "Interactive Next.js foundations course.",
};

export default function NextClassroom() {
  return (
    <div lang="en">
      <NextStudentGate />
    </div>
  );
}
