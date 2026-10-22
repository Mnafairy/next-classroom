import { classroomDatabase } from "../student/database";
export type AdminAccount = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  active: boolean;
  sourceId?: string;
};
export type AdminIdentity = Pick<AdminAccount, "name" | "email"> & {
  id: string;
};
export async function accountCollection() {
  return (await classroomDatabase()).collection<AdminAccount>("admin_accounts");
}
export function loginIdentifier(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._@-]{0,253}$/.test(name) ? name : null;
}
