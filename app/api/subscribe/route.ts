import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
import { hasSubscription, json, newToken, subscriptionCookie, tokenHash, validOrigin } from "./shared";

export async function GET(request: Request) {
  try { return json({ subscribed: await hasSubscription(request) }); }
  catch { return json({ error: "暂时无法查询订阅状态。" }, 503); }
}

export async function POST(request: Request) {
  if (!validOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "请使用页面中的订阅表单。" }, 415);
  if (Number(request.headers.get("content-length")) > 2048) return json({ error: "提交内容过长。" }, 413);
  let data;
  try {
    const raw = await request.text();
    if (raw.length > 2048) return json({ error: "提交内容过长。" }, 413);
    data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
  } catch { return json({ error: "提交内容无效，请重试。" }, 400); }
  if (data.website) return json({ success: true, canUnsubscribe: false });
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email) || email.split("@")[0].length > 64 || email.startsWith(".") || email.includes("..") || email.includes(".@")) return json({ error: "请输入有效的邮箱地址。" }, 400);
  if (data.consent !== true) return json({ error: "请先同意接收品牌邮件。" }, 400);
  try {
    const token = newToken();
    const rows = await getDb().insert(subscribers).values({ email, createdAt: new Date().toISOString(), consentVersion: "2026-10-14", tokenHash: tokenHash(token) }).onConflictDoNothing({ target: subscribers.email }).returning({ email: subscribers.email });
    if (rows.length) return json({ success: true, canUnsubscribe: true }, 200, { "Set-Cookie": subscriptionCookie(request, token) });
    // Duplicate requests do not reveal another subscriber's cancellation token.
    return json({ success: true, canUnsubscribe: await hasSubscription(request, email) });
  } catch { return json({ error: "暂时无法保存订阅，请稍后重试。" }, 503); }
}
