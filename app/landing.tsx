"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import ParticleCursor from "./particle-cursor";
import LivingMeadow from "./living-meadow";

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
    const emailInput = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    if (!email.trim() || !emailInput.validity.valid) {
      setPhase("error"); setMessage("Please enter a valid email address.");
      emailInput.focus(); return;
    }
    const form = new FormData(event.currentTarget);
    setPhase("loading"); setMessage("");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), consent: true, website: form.get("website") || "" }) });
      const result = await response.json() as SubscriptionResponse;
      if (!response.ok) throw new Error(result.error || "Unable to subscribe. Please try again.");
      setPhase("success"); setCanUnsubscribe(Boolean(result.canUnsubscribe));
      setEmail("");
    } catch (error) {
      setPhase("error"); setMessage(error instanceof Error ? error.message : "Connection interrupted. Please try again.");
    }
  }

  async function unsubscribe() {
    setPhase("loading"); setMessage("");
    try {
      const response = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("Unable to unsubscribe. Please try again.");
      setCanUnsubscribe(false); setPhase("idle"); setMessage("Unsubscribed. Your email has been removed.");
    } catch (error) {
      setPhase("success"); setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <div className="landing-shell" id="top">
      <LivingMeadow />
      <div className="photo-shade" aria-hidden="true" />
      <div className="film-finish" aria-hidden="true" />
      <ParticleCursor />
      <a className="skip-link" href="#main">Skip to subscription</a>
      <header className="site-header"><a className="brand-home" href="#top" aria-label="formagain home"><img className="brand-logo" src="/brand/formagain.svg" alt="formagain" width="490" height="97" /></a><span className="launch-status"><i /> COMING SOON</span></header>
      <main id="main" className="main-content">
        <h1 className="tagline">A new beginning, naturally.</h1>
        <section className="newsletter" id="subscribe" aria-label="Email subscription">
          {phase === "success" || (phase === "loading" && canUnsubscribe) ? <div className="subscription-success" role="status"><span aria-hidden="true">✓</span><p>You’re on the list. See you soon.</p></div> : <form noValidate onSubmit={subscribe} className="subscribe-form"><label className="sr-only" htmlFor="email">Your email address</label><div className="email-row"><input id="email" name="email" type="email" autoComplete="email" placeholder="Your email address" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} aria-describedby="subscribe-note subscribe-message" aria-invalid={phase === "error"} disabled={phase === "loading"} /><button type="submit" disabled={phase === "loading"}><span>{phase === "loading" ? "Joining…" : "Subscribe"}</span><Arrow /></button></div><div className="honeypot" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div></form>}
          <p id="subscribe-message" className={`form-message ${phase === "error" ? "error" : ""}`} role={phase === "error" ? "alert" : "status"}>{message}</p>
          <p className="subscribe-note" id="subscribe-note">{canUnsubscribe ? <button disabled={phase === "loading"} onClick={unsubscribe}>{phase === "loading" ? "Working…" : "Unsubscribe"}</button> : "Brand letters. Unsubscribe anytime."}</p>
        </section>
      </main>
      <footer className="site-footer"><span>© 2026 FORMAGAIN</span><div className="footer-links"><button className="instagram-link" type="button" disabled title="Instagram link coming soon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.4"/><circle cx="17" cy="7" r="1" fill="currentColor"/></svg><span>Instagram</span><Arrow diagonal /></button><button onClick={() => setDialog("privacy")}>Privacy</button></div></footer>
      <dialog ref={dialogRef} className="brand-dialog" onCancel={() => setDialog(null)} onClick={e => { if (e.target === dialogRef.current) setDialog(null); }}><button className="dialog-close" aria-label="Close dialog" onClick={() => setDialog(null)}>×</button><div className="privacy-dialog"><span className="eyebrow">YOUR EMAIL, RESPECTED.</span><h2>Privacy</h2><p>We store your email address, subscription date and consent record to share formagain news and collection updates. Your email is never displayed publicly.</p><p>An essential cookie identifies your subscription on this device. Select “Unsubscribe” here to delete your email record. This option may no longer recognize your subscription if you clear cookies or switch devices.</p><p>We are currently collecting sign-ups. Subscribing does not send an immediate email. Collection details will be announced at launch.</p><button className="dialog-confirm" onClick={() => setDialog(null)}>Got it <Arrow /></button></div></dialog>
    </div>
  );
}
