"use client";

import { useEffect, useRef } from "react";

type Phase = "resting" | "gathering" | "following" | "dissolving";
type Origin = { x: number; y: number };
type Particle = {
  x: number; y: number; fromX: number; fromY: number;
  tx: number; ty: number; seed: number; size: number; delay: number;
  duration: number; home: number; alpha: number; fromAlpha: number;
};
const IDLE_DELAY = 650;
const smoothstep = (value: number) => value * value * (3 - 2 * value);

export default function ParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, frame = 0, ready = false, inside = false, compact = false;
    let width = innerWidth, height = innerHeight, phase: Phase = "resting";
    let phaseStart = 0, lastMovement = 0, previousFrame = 0;
    let particles: Particle[] = [], origins: Origin[] = [];
    const pointer = { x: width / 2, y: height / 2 };
    const follow = { ...pointer };
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 24;
    const glow = sprite.getContext("2d")!;
    const gradient = glow.createRadialGradient(12, 12, 0, 12, 12, 12);
    gradient.addColorStop(0, "rgba(255,255,233,1)");
    gradient.addColorStop(.16, "rgba(246,255,208,.95)");
    gradient.addColorStop(.4, "rgba(224,247,179,.30)");
    gradient.addColorStop(1, "rgba(224,247,179,0)");
    glow.fillStyle = gradient; glow.fillRect(0, 0, 24, 24);

    const enabled = () => fine.matches && !reduced.matches && !document.hidden;
    const setPhase = (next: Phase) => { phase = next; canvas.dataset.phase = next; };
    const measureFlowers = () => {
      origins = Array.from(document.querySelectorAll<HTMLElement>(".flower-particle-origin"))
        .filter(el => el.getClientRects().length > 0)
        .map(el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
        .filter(p => p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height);
      canvas.dataset.emitters = String(origins.length);
      particles.forEach((p, i) => { p.home = i % Math.max(1, origins.length); });
    };
    const homePosition = (p: Particle) => {
      const home = origins[p.home];
      return { x: home.x + Math.cos(p.seed) * 9, y: home.y + Math.sin(p.seed * 1.7) * 6 };
    };
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0; previousFrame = 0;
      ctx.clearRect(0, 0, width, height);
      document.documentElement.classList.remove("particle-cursor-active");
      setPhase("resting");
    };
    const start = () => {
      if (!frame && ready && enabled() && phase !== "resting") frame = requestAnimationFrame(draw);
    };
    const gather = (now: number) => {
      measureFlowers();
      if (!origins.length) { stop(); return; }
      const wasResting = phase === "resting";
      particles.forEach(p => {
        if (wasResting) { const home = homePosition(p); p.x = home.x; p.y = home.y; p.alpha = 0; }
        p.fromX = p.x; p.fromY = p.y; p.fromAlpha = p.alpha;
      });
      follow.x = pointer.x; follow.y = pointer.y;
      phaseStart = now; setPhase("gathering");
      document.documentElement.classList.add("particle-cursor-active");
      start();
    };
    const dissolve = (now: number) => {
      if (phase === "resting" || phase === "dissolving") return;
      particles.forEach(p => { p.fromX = p.x; p.fromY = p.y; p.fromAlpha = p.alpha; });
      phaseStart = now; setPhase("dissolving");
      document.documentElement.classList.remove("particle-cursor-active");
      start();
    };

    function draw(now: number) {
      frame = 0;
      if (disposed || !enabled() || !ready || !origins.length) { stop(); return; }
      if (phase !== "dissolving" && phase !== "resting" && now - lastMovement >= IDLE_DELAY) dissolve(now);
      // A transition may have scheduled a frame; this loop owns the next one.
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      const dt = Math.min((now - (previousFrame || now - 16.67)) / 16.67, 2);
      previousFrame = now;
      const tracking = 1 - Math.pow(.35, dt);
      follow.x += (pointer.x - follow.x) * tracking;
      follow.y += (pointer.y - follow.y) * tracking;
      const elapsed = now - phaseStart;
      const scale = compact ? .8 : 1;
      let finished = true;
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (phase === "following") {
          p.x = follow.x + p.tx * scale; p.y = follow.y + p.ty * scale; p.alpha = .74;
        } else {
          const dissolving = phase === "dissolving";
          const duration = dissolving ? 1400 + p.duration : p.duration;
          const delay = dissolving ? p.delay * 2 : p.delay;
          const progress = Math.min(1, Math.max(0, (elapsed - delay) / duration));
          const t = smoothstep(progress);
          // Dissolve locally into the air; no destination or return flight.
          const spread = 24 + (Math.sin(p.seed * 1.3) + 1) * 17;
          const target = dissolving
            ? { x: p.fromX + Math.cos(p.seed) * spread, y: p.fromY + Math.sin(p.seed) * spread * .65 - 18 }
            : { x: follow.x + p.tx * scale, y: follow.y + p.ty * scale };
          const dx = target.x - p.fromX, dy = target.y - p.fromY;
          const length = Math.max(1, Math.hypot(dx, dy));
          const arc = Math.sin(Math.PI * t) * Math.sin(p.seed) * (dissolving ? 6 : 18);
          p.x = p.fromX + dx * t - dy / length * arc;
          p.y = p.fromY + dy * t + dx / length * arc - Math.sin(Math.PI * t) * (dissolving ? 3 : 20);
          p.alpha = dissolving ? p.fromAlpha * (1 - smoothstep(progress))
            : p.fromAlpha + (.74 - p.fromAlpha) * Math.min(1, progress * 5);
          if (progress < 1) finished = false;
        }
        ctx!.globalAlpha = p.alpha * (.88 + .12 * Math.sin(now * .003 + p.seed));
        const size = p.size * (compact ? .9 : 1);
        ctx!.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx!.globalAlpha = 1; ctx!.globalCompositeOperation = "source-over";
      if (phase === "dissolving" && finished) { stop(); return; }
      if (phase === "gathering" && finished) setPhase("following");
      frame = requestAnimationFrame(draw);
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !enabled()) return;
      const moved = !inside || Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > .4;
      inside = true;
      pointer.x = event.clientX; pointer.y = event.clientY;
      compact = event.target instanceof Element && Boolean(event.target.closest("input,button,a"));
      if (!moved) return;
      const now = performance.now(); lastMovement = now;
      if (!ready) return;
      if (phase === "resting" || phase === "dissolving") gather(now); else start();
    };
    const leave = () => { inside = false; dissolve(performance.now()); };
    const suspend = () => { inside = false; stop(); };
    const visibility = () => { if (document.hidden) suspend(); };
    const preference = () => { if (!enabled()) suspend(); };
    const resize = () => {
      stop(); width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); measureFlowers(); inside = false;
    };
    const shape = new Image();
    shape.onload = () => {
      if (disposed) return;
      const mask = document.createElement("canvas"); mask.width = 94; mask.height = 89;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      m.drawImage(shape, 0, 0, 94, 89);
      const pixels = m.getImageData(0, 0, 94, 89).data;
      for (let y = 1; y < 88; y += 3) for (let x = 1; x < 93; x += 3) {
        if (pixels[(y * 94 + x) * 4 + 3] <= 100) continue;
        const seed = particles.length * 2.39996;
        particles.push({ x: 0, y: 0, fromX: 0, fromY: 0,
          tx: (x - 47) * .34, ty: (y - 44.5) * .34,
          seed, size: 2.5 + (Math.sin(seed) + 1) * .5,
          delay: (Math.sin(seed * 2) + 1) * 25,
          duration: 320 + (Math.cos(seed) + 1) * 45,
          home: 0, alpha: 0, fromAlpha: 0 });
      }
      ready = particles.length > 0; measureFlowers();
      if (inside && performance.now() - lastMovement < IDLE_DELAY) gather(performance.now());
    };
    shape.src = "/brand/mouse.svg";
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", visibility);
    fine.addEventListener("change", preference); reduced.addEventListener("change", preference);
    return () => {
      disposed = true; stop(); shape.onload = null;
      window.removeEventListener("resize", resize); window.removeEventListener("scroll", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", suspend);
      document.removeEventListener("visibilitychange", visibility);
      fine.removeEventListener("change", preference); reduced.removeEventListener("change", preference);
    };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
