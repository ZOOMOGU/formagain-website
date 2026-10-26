"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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
      <a className="skip-link" href="#main">跳至主要内容</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="formagain 首页">formagain<span aria-hidden="true">✳</span></a>
        <span className="header-note">NEW FORM. SAME ENERGY.</span>
        <span className="launch-status"><i /> 即将发生 <span>/ COMING SOON</span></span>
      </header>

      <main id="main" className="instrument" aria-labelledby="hero-title">
        <div className="instrument-top"><span><i className="signal-light" /> FORMAGAIN — IN THE MAKING</span><span>VOL. 001 / A NEW BEGINNING</span></div>
        <div className="hero-body">
          <div className="hero-copy">
            <p className="eyebrow">重新感受，重新生长。</p>
            <h1 id="hero-title">A new form<br />of <span>feeling.</span></h1>
            <p className="intro">让身体自由，让生机发生。<br />为运动与日常而生的 formagain，即将到来。</p>
            <section className="newsletter" id="subscribe" aria-labelledby="newsletter-title">
              <h2 id="newsletter-title">下一个开始，先告诉你。</h2>
              {phase === "success" || (phase === "loading" && canUnsubscribe) ? <div className="subscription-success" role="status"><span className="success-check" aria-hidden="true">↗</span><div><strong>YOU’RE ON THE LIST.</strong><p>已加入订阅。新生，将在你的收件箱发生。</p></div></div> : <form onSubmit={subscribe} className="subscribe-form"><label className="sr-only" htmlFor="email">你的邮箱地址</label><div className="email-row"><input id="email" name="email" type="email" autoComplete="email" placeholder="你的邮箱地址" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} aria-describedby="subscribe-note subscribe-message" aria-invalid={phase === "error"} disabled={phase === "loading"} /><button type="submit" disabled={phase === "loading"}><span>{phase === "loading" ? "正在加入…" : "订阅来信"}</span><Arrow diagonal /></button></div><div className="honeypot" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div></form>}
              <p id="subscribe-message" className={`form-message ${phase === "error" ? "error" : ""}`} role={phase === "error" ? "alert" : "status"}>{message}</p>
              <div className="subscribe-note" id="subscribe-note">{canUnsubscribe ? <button disabled={phase === "loading"} onClick={unsubscribe}>{phase === "loading" ? "正在处理…" : "取消本次订阅"}</button> : <span>订阅即同意接收品牌来信，随时可以退订。</span>}<button onClick={() => setDialog("privacy")}>隐私说明 ↗</button></div>
            </section>
          </div>
          <div className="living-display" role="img" aria-label="透过磨砂玻璃，一枚绿色有机环缓缓呼吸，象征不断生长的新生形态">
            <div className="display-grid" />
            <span className="coordinate coordinate-top">FIG. 01 — LIFE IN MOTION</span>
            <span className="cross cross-one">+</span><span className="cross cross-two">+</span>
            <div className="orbit-track" />
            <div className="organic-form"><div className="organic-core" /></div>
            <div className="glass-band"><span>F O R M / A G A I N</span></div>
            <div className="display-bottom"><span><i /> EVER EVOLVING</span><span>∞</span></div>
          </div>
        </div>
        <div className="instrument-bottom" aria-hidden="true"><div className="channel"><span className="channel-index">01</span><div><strong>MOVE</strong><span>身体的频率</span></div><div className="waveform">{Array.from({length:25},(_,i)=><i key={i} style={{height: `${8 + Math.sin(i * .65) ** 2 * 18}px`}} />)}</div></div><div className="channel"><span className="channel-index">02</span><div><strong>FEEL</strong><span>感受的共振</span></div><div className="dial"><i /></div></div><div className="channel"><span className="channel-index">03</span><div><strong>AGAIN</strong><span>新生的循环</span></div><span className="loop-symbol">∞</span></div></div>
        <span className="screw screw-tl" aria-hidden="true" /><span className="screw screw-tr" aria-hidden="true" /><span className="screw screw-bl" aria-hidden="true" /><span className="screw screw-br" aria-hidden="true" />
      </main>
      <footer className="site-footer"><span>© 2026 FORMAGAIN</span><p>未来有形，生机不息。</p><span>MOVEMENT IS A NEW BEGINNING. <i /></span></footer>
      <dialog ref={dialogRef} className="brand-dialog" onCancel={() => setDialog(null)} onClick={e => { if (e.target === dialogRef.current) setDialog(null); }}><button className="dialog-close" aria-label="关闭弹窗" onClick={() => setDialog(null)}>×</button><div className="privacy-dialog"><span className="eyebrow">YOUR EMAIL, RESPECTED.</span><h2>隐私说明</h2><p>订阅时，我们会保存你的邮箱地址、订阅时间和同意记录，用于 formagain 的品牌与系列消息。邮箱不会显示在公开页面中。</p><p>我们会用必要的浏览器 Cookie 识别你在本设备上完成的订阅。通过此设备上的「取消本次订阅」可以删除对应的邮箱记录。清除 Cookie 或更换设备后，该入口可能无法识别原订阅。</p><p>目前页面收集订阅意向，不会立即发送邮件。系列的正式信息以未来发布为准。</p><button className="dialog-confirm" onClick={() => setDialog(null)}>知道了 <Arrow /></button></div></dialog>
    </div>
  );
}
