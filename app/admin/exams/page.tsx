import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, getAdminIdentity } from "@/lib/admin/auth";
import ExamResults from "@/components/admin/ExamResults";
import "../admin.css";
import "./exams.css";
export const metadata = {
  title: "КодЛаб · Шалгалтын дүн",
  robots: { index: false, follow: false },
};
export default async function ExamResultsPage() {
  const identity = await getAdminIdentity(
    (await cookies()).get(ADMIN_COOKIE)?.value,
  );
  if (!identity) redirect("/admin");
  return <ExamResults identity={identity} />;
}
