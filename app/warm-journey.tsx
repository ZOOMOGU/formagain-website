"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type Step = "welcome" | "choose" | "blooming" | "thanks" | "quiet";
const wordRows = [
  ["showing up", "belief", "mind · body · spirit", "progress", "consistency", "intention"],
  ["a little care", "your journey, your pace", "trying is cool", "trust the process", "move to feel alive"],
  ["room to grow", "mental strength", "metamorphosis", "endurance", "clarity through movement", "a moment of wonder"],
];
const colors = ["#f4e7b3", "#d6e8c8", "#e4d5ec"];

function IntentionField({ selected, onToggle, paused, onPause }: { selected: string[]; onToggle: (word: string) => void; paused: boolean; onPause: () => void }) {
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const hovering = useRef(-1);
  const initialized = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    const directions = [1, -1, 1];
    if (!initialized.current) {
      rows.current.forEach((row, i) => { if (row) row.scrollLeft = (row.scrollWidth - row.clientWidth) * (i === 1 ? .5 : .16); });
      initialized.current = true;
    }
    const positions = rows.current.map(row => row?.scrollLeft ?? 0);
    function tick(now: number) {
      const elapsed = last ? Math.min(now - last, 40) : 0;
      last = now;
      if (!paused && !media.matches && !document.hidden) rows.current.forEach((row, i) => {
        if (!row) return;
        if (hovering.current === i || row.contains(document.activeElement)) { positions[i] = row.scrollLeft; return; }
        const max = row.scrollWidth - row.clientWidth;
        if (max <= 0) return;
        const next = positions[i] + directions[i] * elapsed * .013;
        positions[i] = Math.max(0, Math.min(max, next));
        row.scrollLeft = positions[i];
        if (next >= max || next <= 0) directions[i] *= -1;
      });
      frame = requestAnimationFrame(tick);
    }
    if (!paused && !media.matches) frame = requestAnimationFrame(tick);
    const preferenceChange = () => { cancelAnimationFrame(frame); last = 0; if (!paused && !media.matches) frame = requestAnimationFrame(tick); };
    media.addEventListener("change", preferenceChange);
    const listeners = rows.current.map(row => {
      if (!row) return null;
      const wheel = (event: WheelEvent) => {
        if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
        if (row.scrollWidth <= row.clientWidth) return;
        event.preventDefault(); row.scrollLeft += event.deltaY;
      };
      row.addEventListener("wheel", wheel, { passive: false });
      return () => row.removeEventListener("wheel", wheel);
    });
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", preferenceChange); listeners.forEach(remove => remove?.()); };
  }, [paused]);

  return <div className="intention-field" aria-label="Choose three intentions">
    {wordRows.map((words, row) => <div key={row} className={`intention-row intention-row-${row}`} ref={element => { rows.current[row] = element; }} onMouseEnter={() => { hovering.current = row; }} onMouseLeave={() => { hovering.current = -1; }} onTouchStart={onPause} role="group" aria-label={`Intentions, row ${row + 1}`}>
      <div className="intention-track">{words.map(word => <button key={word} className={`intention-pill ${selected.includes(word) ? "is-selected" : ""}`} aria-pressed={selected.includes(word)} aria-disabled={selected.length === 3 && !selected.includes(word)} onClick={() => onToggle(word)}>{word}</button>)}</div>
    </div>)}
  </div>;
}

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
  const [selected, setSelected] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
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

  function toggleWord(word: string) {
    setSelectionMessage("");
    if (selected.includes(word)) setSelected(selected.filter(value => value !== word));
    else if (selected.length < 3) setSelected([...selected, word]);
    else setSelectionMessage("Three is a lovely beginning. Remove one to choose another.");
  }
  function reset() { setSelected([]); setPaused(false); setSelectionMessage(""); setStep("choose"); }

  return <div className={`warm-journey journey-${step}`} style={{ "--wish-color": colors[0] } as CSSProperties}>
    <div className={`wish-world ${grown ? "has-grown" : ""}`} aria-hidden="true">
      <div className="wish-light" />
      {grown && <><div className="grown-flower wish-bouquet">{selected.map((word, i) => <div key={word} className={`bouquet-stem bouquet-stem-${i}`} style={{ color: colors[i] }}><Bloom variant={i} /></div>)}</div><div className="wish-sparks">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--spark-x": `${Math.sin(i * 2.4) * (60 + i * 5)}px`, "--spark-y": `${-40 - i * 14}px`, "--spark-delay": `${i * 65}ms` } as CSSProperties} />)}</div></>}
    </div>

    {step === "welcome" && <section className="journey-panel welcome-panel" aria-label="An invitation from formagain">
      <p className="journey-kicker">SMALL THINGS. BEAUTIFUL BEGINNINGS.</p>
      <h1 ref={headingRef} tabIndex={-1}>A little care.<br /><em>A world of possibility.</em></h1>
      <p className="journey-copy">Let’s make something beautiful, together.</p>
      <button className="journey-primary" onClick={() => setStep("choose")}>Make the world beautiful <span aria-hidden="true">↗</span></button>
      <p className="journey-whisper">A small moment, just for you.</p>
    </section>}

    {step === "choose" && <section className="journey-panel choose-panel intention-panel" aria-label="Plant a little beauty">
      <div className="intention-heading">
        <p className="journey-kicker">A SMALL ACT OF BECOMING</p>
        <h1 ref={headingRef} tabIndex={-1}>What will you bring<br />into the world?</h1>
        <p className="intention-subtitle">Choose three words. Let something beautiful grow.</p>
      </div>
      <IntentionField selected={selected} onToggle={toggleWord} paused={paused} onPause={() => setPaused(true)} />
      <div className="intention-summary">
        <div className="selected-intentions" aria-label="Your chosen intentions">
          {selected.length === 0 ? <span className="selection-placeholder">A little of you, a little more beauty.</span> : selected.map(word => <button key={word} onClick={() => toggleWord(word)} aria-label={`Remove ${word}`} title="Click to remove">{word}</button>)}
        </div>
        <p className="intention-count" role="status">{selected.length} / 3 intentions chosen</p>
        <p className="selection-message" role="status">{selectionMessage}</p>
        <div className="intention-controls"><button className="pause-words" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Let the words drift" : "Pause the words"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button><button className="grow-intentions" disabled={selected.length !== 3} onClick={() => setStep("blooming")}>Let it grow <span aria-hidden="true">↗</span></button></div>
        <button className="journey-text" onClick={() => setStep("welcome")}>Back to the meadow</button>
      </div>
    </section>}

    {step === "blooming" && <section className="journey-panel blooming-panel" aria-live="polite"><p className="journey-kicker">SMALL INTENTIONS. BEAUTIFUL BEGINNINGS.</p><h1 ref={headingRef} tabIndex={-1}>Look what you’ve started.</h1></section>}

    {(step === "thanks" || step === "quiet") && <section className="journey-panel thanks-panel">
      <p className="journey-kicker">YOU LEFT SOMETHING BEAUTIFUL HERE.</p>
      <h1 ref={headingRef} tabIndex={-1}>Thank you for making the world<br /><em>a little more beautiful.</em></h1>
      {step === "thanks" ? <div className="gentle-invitation"><p className="invitation-title">Be part of what grows next.</p><p className="invitation-copy">Leave your email for letters & new beginnings from formagain.</p>{children}<button className="journey-text" onClick={() => setStep("quiet")}>Just enjoy this moment</button></div> : <div className="quiet-actions"><p className="journey-copy">This little moment is yours. Stay as long as you like.</p><button className="journey-text" onClick={() => setStep("thanks")}>Stay in touch ↗</button><button className="journey-text" onClick={reset}>Plant another beginning</button></div>}
    </section>}
  </div>;
}
