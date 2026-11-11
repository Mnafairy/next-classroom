import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { classroomDatabase } from "../student/database";
import {
  accountCollection,
  loginIdentifier,
  type AdminAccount,
  type AdminIdentity,
} from "./accounts";

const derive = promisify(scrypt);
export const ADMIN_COOKIE = "kodlab-admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const passwordPattern = /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/;
export async function adminConfigured() {
  return (await accountCollection())
    .countDocuments({ active: true }, { limit: 1 })
    .then((count) => count > 0);
}
export async function authenticateAdmin(
  username: unknown,
  password: unknown,
): Promise<AdminAccount | null> {
  const id = loginIdentifier(username);
  const account = id
    ? await (
        await accountCollection()
      ).findOne({ active: true, $or: [{ _id: id }, { email: id }] })
    : null;
  const valid = await verifyPassword(
    password,
    account?.passwordHash || `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`,
  );
  if (!account) return null;
  if (account.setupRequired && password === account.email) return account;
  return valid && password !== account.email ? account : null;
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: unknown, encoded: string) {
  if (
    typeof password !== "string" ||
    password.length > 1024 ||
    !passwordPattern.test(encoded)
  )
    return false;
  const [, salt, key] = encoded.split(":");
  return timingSafeEqual(
    (await derive(password, salt, 64)) as Buffer,
    Buffer.from(key, "hex"),
  );
}
export async function authCollections() {
  const db = await classroomDatabase();
  const sessions = db.collection<{
    _id: string;
    version: string;
    accountId: string;
    expiresAt: Date;
  }>("admin_sessions");
  const attempts = db.collection<{
    _id: string;
    count: number;
    expiresAt: Date;
  }>("admin_login_attempts");
  // createIndex is idempotent; MongoDB TTL cleanup is separate from expiry enforcement below.
  await Promise.all([
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  return { sessions, attempts };
}
export async function allowLogin(request: Request) {
  const { attempts } = await authCollections();
  const windowMs = 15 * 60 * 1000;
  const now = Date.now();
  const address =
    process.env.VERCEL === "1"
      ? (request.headers.get("x-forwarded-for") || "unknown")
          .split(",")[0]
          .trim()
      : "local";
  const addressHash = createHmac(
    "sha256",
    process.env.ADMIN_RATE_LIMIT_KEY || "",
  )
    .update(address)
    .digest("hex");
  const _id = `${Math.floor(now / windowMs)}:${addressHash}`;
  const attempt = await attempts.findOneAndUpdate(
    { _id },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(now + windowMs * 2) },
    },
    { upsert: true, returnDocument: "after" },
  );
  return (attempt?.count || 0) <= 10;
}
export async function createAdminSession(account: AdminAccount) {
  if (account.setupRequired) throw new Error("Teacher password setup required");
  const token = randomBytes(32).toString("base64url");
  const { sessions } = await authCollections();
  await sessions.insertOne({
    _id: hash(token),
    version: `setup-v2:${hash(account.passwordHash)}`,
    accountId: account._id,
    expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
  });
  return token;
}
export function requestToken(request: Request) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
}
export async function getAdminIdentity(
  token?: string,
): Promise<AdminIdentity | null> {
  if (!token || !/^[\w-]{43}$/.test(token)) return null;
  const { sessions } = await authCollections();
  const session = await sessions.findOne({
    _id: hash(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session?.accountId) return null;
  const account = await (
    await accountCollection()
  ).findOne({ _id: session.accountId, active: true });
  if (
    !account ||
    account.setupRequired ||
    session.version !== `setup-v2:${hash(account.passwordHash)}`
  )
    return null;
  return { id: account._id, name: account.name, email: account.email };
}
export async function isAdmin(token?: string) {
  return !!(await getAdminIdentity(token));
}
export async function endAdminSession(token?: string) {
  if (token && /^[\w-]{43}$/.test(token)) {
    const { sessions } = await authCollections();
    await sessions.deleteOne({ _id: hash(token) });
  }
}
