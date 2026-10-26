import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
import { cookieToken, json, subscriptionCookie, tokenHash, validOrigin } from "../subscribe/shared";

export async function POST(request: Request) {
  if (!validOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  const token = cookieToken(request);
  if (!token) return json({ error: "本设备上没有可取消的订阅。" }, 401);
  try {
    await getDb().delete(subscribers).where(eq(subscribers.tokenHash, tokenHash(token)));
    return json({ success: true }, 200, { "Set-Cookie": subscriptionCookie(request, "", 0) });
  } catch { return json({ error: "暂时无法取消，请稍后重试。" }, 503); }
}
