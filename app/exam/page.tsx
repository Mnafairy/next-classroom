import type { Metadata } from "next";
import ExamWorkspace from "@/components/exam/ExamWorkspace";
import "./exam.css";

export const metadata: Metadata = {
  title: "КодЛаб · JavaScript шалгалт",
  robots: { index: false, follow: false },
};
export default function ExamPage() {
  return <ExamWorkspace />;
}
