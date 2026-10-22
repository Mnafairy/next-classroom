import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminConfigured,
  getAdminIdentity,
} from "@/lib/admin/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import "./admin.css";
export const metadata: Metadata = {
  title: "КодЛаб · Багшийн орчин",
  robots: { index: false, follow: false },
};
export const runtime = "nodejs";
export default async function AdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const identity = await getAdminIdentity(token);
  return identity ? (
    <AdminDashboard identity={identity} />
  ) : (
    <AdminLogin configured={await adminConfigured()} />
  );
}
