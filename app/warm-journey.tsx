"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type Step = "welcome" | "choose" | "blooming" | "thanks" | "quiet";
const wishes = [
  { name: "a little care", note: "For the things we sometimes overlook.", color: "#f4e7b3" },
  { name: "room to grow", note: "For beginnings, however small.", color: "#d6e8c8" },
  { name: "a moment of wonder", note: "For the beauty waiting to be noticed.", color: "#e4d5ec" },
];

function Bloom({ variant }: { variant: number }) {
  return <svg className={`wish-flower flower-kind-${variant}`} viewBox="0 0 220 260" fill="none" aria-hidden="true">
    <path className="wish-stem" d="M110 248C98 200 121 160 110 91" stroke="#b0c99c" strokeWidth="2" />
    <path className="wish-leaf leaf-left" d="M109 185C69 184 65 158 58 147C88 144 106 164 109 185Z" fill="#b0c99c" fillOpacity=".55" />
    <path className="wish-leaf leaf-right" d="M110 160C141 160 158 137 159 123C129 123 111 140 110 160Z" fill="#c5d7af" fillOpacity=".65" />
    <g className="wish-head">
      {Array.from({ length: variant === 1 ? 8 : 6 }, (_, i) => <path key={i} transform={`rotate(${i * (variant === 1 ? 45 : 60)} 110 87)`} d={variant === 2 ? "M110 88C90 78 76 39 96 35C117 31 127 67 110 88Z" : "M110 88C84 83 78 43 99 40C124 32 132 72 110 88Z"} fill="currentColor" fillOpacity=".8" stroke="currentColor" strokeWidth=".6" />)}
      <circle cx="110" cy="87" r="9" fill="#f7d689" />
      <circle cx="108" cy="84" r="3" fill="#fff6d1" />
    </g>
  </svg>;
}

export default function WarmJourney({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const touchY = useRef<number | null>(null);
  const wish = wishes[selected];
  const grown = step === "blooming" || step === "thanks" || step === "quiet";

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (step !== "blooming") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setStep("thanks"), reduced ? 150 : 2200);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "choose") return;
    const wheel = wheelRef.current;
    if (!wheel) return;
    let accumulated = 0;
    let lastChange = 0;
    function scroll(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (Date.now() - lastChange < 360) return;
      accumulated += event.deltaY;
      if (Math.abs(accumulated) < 24) return;
      const direction = accumulated > 0 ? 1 : 2;
      setSelected(previous => (previous + direction) % 3);
      accumulated = 0;
      lastChange = Date.now();
    }
    wheel.addEventListener("wheel", scroll, { passive: false });
    return () => wheel.removeEventListener("wheel", scroll);
  }, [step]);

  function reset() { setStep("choose"); }

  return <div className={`warm-journey journey-${step}`} style={{ "--wish-color": wish.color } as CSSProperties}>
    <div className={`wish-world ${grown ? "has-grown" : ""}`} aria-hidden="true">
      <div className="wish-light" />
      {grown && <><div className="grown-flower"><Bloom variant={selected} /></div><div className="wish-sparks">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--spark-x": `${Math.sin(i * 2.4) * (60 + i * 5)}px`, "--spark-y": `${-40 - i * 14}px`, "--spark-delay": `${i * 65}ms` } as CSSProperties} />)}</div></>}
    </div>

    {step === "welcome" && <section className="journey-panel welcome-panel" aria-label="An invitation from formagain">
      <p className="journey-kicker">SMALL THINGS. BEAUTIFUL BEGINNINGS.</p>
      <h1 ref={headingRef} tabIndex={-1}>A little care.<br /><em>A world of possibility.</em></h1>
      <p className="journey-copy">Let’s make something beautiful, together.</p>
      <button className="journey-primary" onClick={() => setStep("choose")}>Make the world beautiful <span aria-hidden="true">↗</span></button>
      <p className="journey-whisper">A small moment, just for you.</p>
    </section>}

    {step === "choose" && <section className="journey-panel choose-panel" aria-label="Plant a little beauty">
      <p className="journey-kicker">EVERY BEAUTIFUL THING STARTS SOMEWHERE.</p>
      <h1 ref={headingRef} tabIndex={-1}>What would you like to grow?</h1>
      <div className="wish-selector" ref={wheelRef} onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault(); setSelected(previous => (previous + (event.key === "ArrowDown" ? 1 : 2)) % 3);
        }
      }} onTouchStart={event => { touchY.current = event.touches[0].clientY; }} onTouchEnd={event => {
        if (touchY.current === null) return;
        const delta = touchY.current - event.changedTouches[0].clientY;
        if (Math.abs(delta) > 24) setSelected(previous => (previous + (delta > 0 ? 1 : 2)) % 3);
        touchY.current = null;
      }} role="group" aria-label="Choose what to grow. Scroll, swipe or use arrow keys.">
        <div className="selection-window" aria-hidden="true"><span>✧</span><span>✧</span></div>
        {wishes.map((item, i) => {
          const position = (i - selected + 4) % 3 - 1;
          return <button key={item.name} type="button" className={`wish-option ${selected === i ? "selected" : ""}`} style={{ "--option-position": position } as CSSProperties} aria-pressed={selected === i} onClick={() => setSelected(i)}>{item.name}</button>;
        })}
      </div>
      <p className="wish-description" aria-live="polite">{wish.note}</p>
      <p className="selector-hint">SCROLL, SWIPE OR TAP TO CHOOSE</p>
      <button className="plant-button" onClick={() => setStep("blooming")} aria-label={`Plant ${wish.name}`}><span className="seed-orbit" aria-hidden="true"><i /></span><span>Plant {wish.name}</span><span className="plant-arrow" aria-hidden="true">↓</span></button>
      <button className="journey-text" onClick={() => setStep("welcome")}>Back to the meadow</button>
    </section>}

    {step === "blooming" && <section className="journey-panel blooming-panel" aria-live="polite"><p className="journey-kicker">A LITTLE {selected === 0 ? "CARE" : selected === 1 ? "SPACE" : "WONDER"} GOES A LONG WAY.</p><h1 ref={headingRef} tabIndex={-1}>Look what you’ve started.</h1></section>}

    {(step === "thanks" || step === "quiet") && <section className="journey-panel thanks-panel">
      <p className="journey-kicker">YOU LEFT SOMETHING BEAUTIFUL HERE.</p>
      <h1 ref={headingRef} tabIndex={-1}>Thank you for making the world<br /><em>a little more beautiful.</em></h1>
      {step === "thanks" ? <div className="gentle-invitation"><p className="invitation-title">Be part of what grows next.</p><p className="invitation-copy">Leave your email for letters & new beginnings from formagain.</p>{children}<button className="journey-text" onClick={() => setStep("quiet")}>Just enjoy this moment</button></div> : <div className="quiet-actions"><p className="journey-copy">This little moment is yours. Stay as long as you like.</p><button className="journey-text" onClick={() => setStep("thanks")}>Stay in touch ↗</button><button className="journey-text" onClick={reset}>Plant another beginning</button></div>}
    </section>}
  </div>;
}
