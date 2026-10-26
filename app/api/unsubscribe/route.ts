import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
import { cookieToken, json, subscriptionCookie, tokenHash, validOrigin } from "../subscribe/shared";

export async function POST(request: Request) {
  if (!validOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const token = cookieToken(request);
  if (!token) return json({ error: "No subscription was found on this device." }, 401);
  try {
    await getDb().delete(subscribers).where(eq(subscribers.tokenHash, tokenHash(token)));
    return json({ success: true }, 200, { "Set-Cookie": subscriptionCookie(request, "", 0) });
  } catch { return json({ error: "Unable to unsubscribe. Please try again." }, 503); }
}
