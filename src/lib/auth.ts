import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mc_admin";
export const VISITOR_COOKIE = "mc_visitor";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

/** Create a signed admin session token: base64url(payload).hmac */
export function createToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: Date.now() })).toString(
    "base64url",
  );
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== "admin") return false;
    if (typeof data.iat !== "number") return false;
    if (Date.now() - data.iat > SESSION_MAX_AGE * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

/** Constant-time comparison of a submitted password against ADMIN_PASSWORD. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(String(input));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Server-side check for the current request's admin session. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export function newVisitorId(): string {
  return crypto.randomUUID();
}
