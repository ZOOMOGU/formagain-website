"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import ParticleCursor from "./particle-cursor";

type Dialog = "privacy" | null;
type SubscriptionResponse = { subscribed?: boolean; error?: string; canUnsubscribe?: boolean };
const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export default function Landing() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [canUnsubscribe, setCanUnsubscribe] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/subscribe").then(r => r.json()).then((data: unknown) => {
      if (active && (data as SubscriptionResponse).subscribed) { setPhase("success"); setCanUnsubscribe(true); }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (dialog) { dialogRef.current?.showModal(); document.body.style.overflow = "hidden"; }
    else { dialogRef.current?.close(); document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [dialog]);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "loading") return;
    const form = new FormData(event.currentTarget);
    setPhase("loading"); setMessage("");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), consent: true, website: form.get("website") || "" }) });
      const result = await response.json() as SubscriptionResponse;
      if (!response.ok) throw new Error(result.error || "暂时无法订阅，请稍后重试。");
      setPhase("success"); setCanUnsubscribe(Boolean(result.canUnsubscribe));
      setEmail("");
    } catch (error) {
      setPhase("error"); setMessage(error instanceof Error ? error.message : "网络连接异常，请稍后重试。");
    }
  }

  async function unsubscribe() {
    setPhase("loading"); setMessage("");
    try {
      const response = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("暂时无法取消，请稍后重试。");
      setCanUnsubscribe(false); setPhase("idle"); setMessage("已取消订阅，你的邮箱已从名单中移除。");
    } catch (error) {
      setPhase("success"); setMessage(error instanceof Error ? error.message : "请稍后重试。");
    }
  }

  return (
    <div className="landing-shell" id="top">
      <img className="background-photo" src="/images/meadow.jpg" alt="" width="735" height="492" fetchPriority="high" />
      <div className="photo-shade" aria-hidden="true" />
      <ParticleCursor />
      <a className="skip-link" href="#main">跳至订阅</a>
      <header className="site-header"><span className="launch-status"><i /> COMING SOON</span></header>
      <main id="main" className="main-content">
        <h1><img className="brand-logo" src="/brand/formagain.svg" alt="formagain" width="490" height="97" /></h1>
        <p className="tagline">新生，自然而然。</p>
        <section className="newsletter" id="subscribe" aria-label="邮箱订阅">
          {phase === "success" || (phase === "loading" && canUnsubscribe) ? <div className="subscription-success" role="status"><span aria-hidden="true">✓</span><p>已订阅。下个开始，见。</p></div> : <form onSubmit={subscribe} className="subscribe-form"><label className="sr-only" htmlFor="email">你的邮箱地址</label><div className="email-row"><input id="email" name="email" type="email" autoComplete="email" placeholder="留下邮箱，静候新生" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} aria-describedby="subscribe-note subscribe-message" aria-invalid={phase === "error"} disabled={phase === "loading"} /><button type="submit" disabled={phase === "loading"}><span>{phase === "loading" ? "加入中…" : "订阅"}</span><Arrow /></button></div><div className="honeypot" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div></form>}
          <p id="subscribe-message" className={`form-message ${phase === "error" ? "error" : ""}`} role={phase === "error" ? "alert" : "status"}>{message}</p>
          <p className="subscribe-note" id="subscribe-note">{canUnsubscribe ? <button disabled={phase === "loading"} onClick={unsubscribe}>{phase === "loading" ? "处理中…" : "取消订阅"}</button> : "订阅品牌来信，随时退订。"}</p>
        </section>
      </main>
      <footer className="site-footer"><span>© 2026 FORMAGAIN</span><button onClick={() => setDialog("privacy")}>隐私说明</button></footer>
      <dialog ref={dialogRef} className="brand-dialog" onCancel={() => setDialog(null)} onClick={e => { if (e.target === dialogRef.current) setDialog(null); }}><button className="dialog-close" aria-label="关闭弹窗" onClick={() => setDialog(null)}>×</button><div className="privacy-dialog"><span className="eyebrow">YOUR EMAIL, RESPECTED.</span><h2>隐私说明</h2><p>订阅时，我们会保存你的邮箱地址、订阅时间和同意记录，用于 formagain 的品牌与系列消息。邮箱不会显示在公开页面中。</p><p>我们会用必要的浏览器 Cookie 识别你在本设备上完成的订阅。通过此设备上的「取消本次订阅」可以删除对应的邮箱记录。清除 Cookie 或更换设备后，该入口可能无法识别原订阅。</p><p>目前页面收集订阅意向，不会立即发送邮件。系列的正式信息以未来发布为准。</p><button className="dialog-confirm" onClick={() => setDialog(null)}>知道了 <Arrow /></button></div></dialog>
    </div>
  );
}
