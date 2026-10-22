import type { Metadata } from "next";
import PythonLab from "@/components/python/PythonLab";

export const metadata: Metadata = {
  title: "КодЛаб · Python",
  description:
    "9, 10-р ангийн Python дадлагын орчин. Нөхцөл, давталтын дасгал, мэдлэгийн сорил, чөлөөт код.",
};

export default function PythonPage() {
  return <PythonLab />;
}
