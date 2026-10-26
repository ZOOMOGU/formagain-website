"use client";

import { useEffect, useRef } from "react";

const plants = [
  { name: "near-left", variant: 0, anchor: 78, head: .35, headY: .18 },
  { name: "mid-left", variant: 2, anchor: 32, head: .68, headY: .17 },
  { name: "far-left", variant: 1, anchor: 50, head: .5, headY: .11 },
  { name: "far-right", variant: 0, anchor: 78, head: .35, headY: .18 },
  { name: "near-right", variant: 1, anchor: 50, head: .5, headY: .11 },
  { name: "edge-right", variant: 2, anchor: 32, head: .68, headY: .17 },
];

export default function LivingMeadow() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elements = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(".flower-sprite") ?? []);
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, last = 0;
    const states = elements.map((el, i) => ({el, x: 0, y: 0, radius: 140, turn: 0, bend: 0, targetTurn: 0, targetBend: 0, head: plants[i].head}));
    const measure = () => {
      for (const s of states) {
        const box = s.el.parentElement!.getBoundingClientRect();
        s.x = box.left + box.width * s.head;
        s.y = box.top + box.height * .16;
        s.radius = Math.max(100, Math.min(175, box.height * .33));
      }
    };
    const animate = (now: number) => {
      frame = 0;
      const dt = Math.min((now - (last || now - 16.67)) / 16.67, 2); last = now;
      let moving = false;
      for (const s of states) {
        const ease = 1 - Math.pow(.91, dt);
        s.turn += (s.targetTurn - s.turn) * ease;
        s.bend += (s.targetBend - s.bend) * ease;
        s.el.style.transform = `rotateY(${s.turn.toFixed(3)}deg) rotateZ(${s.bend.toFixed(3)}deg)`;
        if (Math.abs(s.targetTurn - s.turn) > .002 || Math.abs(s.targetBend - s.bend) > .002) moving = true;
      }
      if (moving) frame = requestAnimationFrame(animate); else last = 0;
    };
    const start = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(animate); };
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch") return;
      for (const s of states) {
        const dx = event.clientX - s.x, dy = event.clientY - s.y;
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / s.radius);
        // A fixed camera, no global parallax: only the flower near the pointer reacts.
        s.targetTurn = (dx / s.radius) * influence * 8;
        s.targetBend = -(dx / s.radius) * influence * 2.4;
      }
      start();
    };
    const reset = () => { states.forEach(s => { s.targetTurn = 0; s.targetBend = 0; }); start(); };
    const preference = () => {
      if (!fine.matches || reduced.matches) {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        states.forEach(s => {s.turn = s.bend = s.targetTurn = s.targetBend = 0; s.el.style.transform = "none";});
      }
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else reset();
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    fine.addEventListener("change", preference); reduced.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure); window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset); window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      fine.removeEventListener("change", preference); reduced.removeEventListener("change", preference);
    };
  }, []);

  return <div className="meadow-layers" ref={rootRef} aria-hidden="true">
    <img className="still-background" src="/images/meadow-track-dusk.png" alt="" width="1532" height="1027" fetchPriority="high" />
    <div className="flower-stage">
      {plants.map(p => <div key={p.name} className={`flower-position ${p.name}`}><div className="flower-sprite" style={{backgroundPosition: `${p.variant * 50}% center`, transformOrigin: `${p.anchor}% 97%`}}><span className="flower-particle-origin" style={{left: `${p.head * 100}%`, top: `${p.headY * 100}%`}} /></div></div>)}
    </div>
  </div>;
}
