"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; delay: number; seed: number; size: number };

export default function ParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !ctx) return;
    let disposed = false, frame = 0, width = innerWidth, height = innerHeight;
    let particles: Particle[] = [];
    let started = 0, last = 0, inside = false, ready = false, speed = 0, compact = false;
    const pointer = { x: width * .72, y: height * .46 };
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const glow = sprite.getContext("2d")!;
    const gradient = glow.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,230,1)");
    gradient.addColorStop(.16, "rgba(247,255,207,.95)");
    gradient.addColorStop(.38, "rgba(221,247,170,.32)");
    gradient.addColorStop(1, "rgba(221,247,170,0)");
    glow.fillStyle = gradient; glow.fillRect(0, 0, 32, 32);

    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pointer.x = Math.min(pointer.x, width); pointer.y = Math.min(pointer.y, height);
    };
    const enabled = () => fine.matches && !reduced.matches;
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      ctx.clearRect(0, 0, width, height);
      document.documentElement.classList.remove("particle-cursor-active");
    };
    const draw = (now: number) => {
      frame = 0;
      if (disposed || !enabled() || !inside || document.hidden || !ready) { stop(); return; }
      const step = Math.min((now - (last || now - 16.67)) / 16.67, 2);
      last = now;
      const elapsed = now - started;
      const gathered = Math.min(Math.max((elapsed - 500) / 2300, 0), 1);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      speed *= Math.pow(.93, step);
      const scale = compact ? .66 : 1;
      for (const p of particles) {
        const settling = Math.min(Math.max((elapsed - p.delay) / 2100, 0), 1);
        const attraction = .006 + settling * .065;
        const drift = (1 - gathered) * 25 + Math.min(speed * .2, 7);
        const tx = pointer.x + p.tx * scale + Math.sin(now * .0013 + p.seed) * drift;
        const ty = pointer.y + p.ty * scale + Math.cos(now * .001 + p.seed * 2) * drift;
        p.vx = (p.vx + (tx - p.x) * attraction * step) * Math.pow(.74, step);
        p.vy = (p.vy + (ty - p.y) * attraction * step) * Math.pow(.74, step);
        p.x += p.vx * step; p.y += p.vy * step;
        const shimmer = .77 + Math.sin(now * .002 + p.seed) * .23;
        ctx.globalAlpha = shimmer * (.58 + gathered * .25);
        const size = p.size * (compact ? .82 : 1);
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!enabled() || !ready || !inside || document.hidden) return;
      document.documentElement.classList.add("particle-cursor-active");
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !enabled()) return;
      speed = Math.min(Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y), 100);
      pointer.x = event.clientX; pointer.y = event.clientY;
      compact = event.target instanceof Element && Boolean(event.target.closest("input,button,a"));
      inside = true;
      if (!started && ready) started = performance.now();
      start();
    };
    const leave = () => { inside = false; stop(); };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    const preference = () => { if (!enabled()) stop(); else start(); };

    // Sample the supplied SVG itself so the particle silhouette matches the artwork.
    const shape = new Image();
    shape.onload = () => {
      if (disposed) return;
      const mask = document.createElement("canvas");
      mask.width = 94; mask.height = 89;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      m.drawImage(shape, 0, 0, 94, 89);
      const pixels = m.getImageData(0, 0, 94, 89).data;
      const points: { x: number; y: number }[] = [];
      for (let y = 1; y < 88; y += 2) {
        for (let x = 1; x < 93; x += 2) {
          if (pixels[(y * 94 + x) * 4 + 3] > 100) points.push({ x, y });
        }
      }
      particles = points.map((p, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2,
        tx: (p.x - 47) * .76, ty: (p.y - 44.5) * .76,
        delay: Math.random() * 700, seed: i * 2.39996, size: 3.8 + Math.random() * 2.4,
      }));
      ready = particles.length > 0;
      if (inside && !started) started = performance.now();
      start();
    };
    shape.src = "/brand/mouse.svg";
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibility);
    fine.addEventListener("change", preference);
    reduced.addEventListener("change", preference);
    return () => {
      disposed = true; stop(); shape.onload = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", visibility);
      fine.removeEventListener("change", preference);
      reduced.removeEventListener("change", preference);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
