import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
import { hasSubscription, json, newToken, subscriptionCookie, tokenHash, validOrigin } from "./shared";

export async function GET(request: Request) {
  try { return json({ subscribed: await hasSubscription(request) }); }
  catch { return json({ error: "Unable to check your subscription." }, 503); }
}

export async function POST(request: Request) {
  if (!validOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Please use the subscription form." }, 415);
  if (Number(request.headers.get("content-length")) > 2048) return json({ error: "The submitted content is too long." }, 413);
  let data;
  try {
    const raw = await request.text();
    if (raw.length > 2048) return json({ error: "The submitted content is too long." }, 413);
    data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
  } catch { return json({ error: "Invalid submission. Please try again." }, 400); }
  if (data.website) return json({ success: true, canUnsubscribe: false });
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email) || email.split("@")[0].length > 64 || email.startsWith(".") || email.includes("..") || email.includes(".@")) return json({ error: "Please enter a valid email address." }, 400);
  if (data.consent !== true) return json({ error: "Please agree to receive brand emails." }, 400);
  try {
    const token = newToken();
    const rows = await getDb().insert(subscribers).values({ email, createdAt: new Date().toISOString(), consentVersion: "2026-10-14", tokenHash: tokenHash(token) }).onConflictDoNothing({ target: subscribers.email }).returning({ email: subscribers.email });
    if (rows.length) return json({ success: true, canUnsubscribe: true }, 200, { "Set-Cookie": subscriptionCookie(request, token) });
    // Duplicate requests do not reveal another subscriber's cancellation token.
    return json({ success: true, canUnsubscribe: await hasSubscription(request, email) });
  } catch { return json({ error: "Unable to save your subscription. Please try again." }, 503); }
}
