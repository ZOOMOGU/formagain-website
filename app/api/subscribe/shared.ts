import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";

export const COOKIE_NAME = "fg_subscription";
export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}
export function cookieToken(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function newToken() { return randomBytes(32).toString("hex"); }
export function subscriptionCookie(request: Request, token: string, maxAge = 31536000) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
export async function hasSubscription(request: Request, email?: string) {
  const token = cookieToken(request);
  if (!token) return false;
  const condition = eq(subscribers.tokenHash, tokenHash(token));
  const rows = await getDb().select({ email: subscribers.email }).from(subscribers).where(email ? and(condition, eq(subscribers.email, email)) : condition).limit(1);
  return rows.length > 0;
}
