"use client";

import { useEffect, useRef } from "react";

const vertexSource = `
attribute vec2 position;
varying vec2 screenUV;
void main() {
  screenUV = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`;
const fragmentSource = `
precision highp float;
uniform sampler2D photo;
uniform vec2 viewport;
uniform vec2 crop;
uniform vec2 focal;
uniform vec2 pointer;
uniform float wind;
uniform float gust;
uniform float clock;
varying vec2 screenUV;
void main() {
  vec2 uv = vec2(screenUV.x, 1. - screenUV.y);
  vec2 imageUV = (uv - .5) * crop + vec2(.5) + (focal - .5) * (1. - crop);
  // Rooted at the bottom: the upper portions of stems bend most.
  float root = pow(max(0., 1. - imageUV.y), .65);
  float grass = smoothstep(.43, .68, imageUV.y) * root;
  // The tall foreground flower begins above the rest of the meadow.
  float flowerX = .60 + (imageUV.y - .35) * .25;
  float flower = exp(-pow((imageUV.x - flowerX) / .055, 2.))
    * smoothstep(.27, .37, imageUV.y) * root;
  float depth = max(grass, flower * .95);
  vec2 distanceToPointer = (uv - pointer) * vec2(viewport.x / viewport.y, 1.);
  float nearby = exp(-dot(distanceToPointer, distanceToPointer) * 5.);
  float ripple = sin(imageUV.x * 29. + clock * 2.1 + imageUV.y * 4.)
    + .35 * sin(imageUV.x * 61. - clock * 1.3);
  float bend = wind * (18. + nearby * 20.) + gust * ripple * (8. + nearby * 14.);
  vec2 displacement = vec2(bend * depth, sin(imageUV.x * 19. + clock) * gust * depth * 3.);
  // The displacement is measured in screen pixels, regardless of viewport size.
  imageUV -= displacement / viewport * crop;
  gl_FragColor = texture2D(photo, clamp(imageUV, .001, .999));
}`;

export default function LivingMeadow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) return;
    let disposed = false, frame = 0, loaded = false, last = 0;
    let wind = 0, target = 0, gust = 0, impulse = 0;
    let px = .5, py = .5, mouseX = .5, mouseY = .5;
    let width = innerWidth, height = innerHeight;
    const shaders: WebGLShader[] = [];
    const compile = (kind: number, source: string) => {
      const shader = gl.createShader(kind);
      if (!shader) return null;
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      shaders.forEach(shader => gl.deleteShader(shader));
      if (program) gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const uniforms = Object.fromEntries(["viewport", "crop", "focal", "pointer", "wind", "gust", "clock"].map(name => [name, gl.getUniformLocation(program, name)]));
    const image = new Image();
    const enabled = () => fine.matches && !motion.matches && !disposed && !gl.isContextLost();
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const render = (now: number) => {
      frame = 0;
      if (!loaded || !enabled() || document.hidden) { stop(); return; }
      const dt = Math.min((now - (last || now - 16.67)) / 16.67, 2); last = now;
      const ease = 1 - Math.pow(.92, dt);
      wind += (target - wind) * ease;
      px += (mouseX - px) * ease; py += (mouseY - py) * ease;
      gust += (impulse - gust) * ease; impulse *= Math.pow(.94, dt);
      gl.uniform2f(uniforms.pointer, px, py);
      gl.uniform1f(uniforms.wind, wind); gl.uniform1f(uniforms.gust, gust);
      gl.uniform1f(uniforms.clock, now * .001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.style.opacity = "1";
      if (Math.abs(target - wind) > .0005 || gust > .001 || Math.abs(px - mouseX) > .0005 || Math.abs(py - mouseY) > .0005) frame = requestAnimationFrame(render);
      else last = 0;
    };
    const start = () => { if (!frame && loaded && enabled() && !document.hidden) frame = requestAnimationFrame(render); };
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5, 2200 / Math.max(width, height));
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const cover = Math.max(width / 735, height / 492);
      gl.uniform2f(uniforms.viewport, width, height);
      gl.uniform2f(uniforms.focal, width <= 760 ? .46 : .5, width <= 760 ? .5 : .54);
      gl.uniform2f(uniforms.crop, width / (735 * cover), height / (492 * cover));
      start();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !enabled()) return;
      const x = event.clientX / width, y = event.clientY / height;
      impulse = Math.min(1.2, impulse + Math.hypot(x - mouseX, y - mouseY) * 7);
      mouseX = x; mouseY = y; target = (x - .5) * 1.9;
      start();
    };
    const leave = () => { target = 0; impulse = 0; start(); };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    const preference = () => {
      if (!enabled()) { stop(); canvas.style.opacity = "0"; wind = target = gust = impulse = 0; }
      else { resize(); start(); }
    };
    const contextLost = (event: Event) => { event.preventDefault(); stop(); canvas.style.opacity = "0"; };
    image.onload = () => {
      if (disposed || gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      loaded = true; resize(); start();
    };
    image.src = "/images/meadow.jpg";
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference); fine.addEventListener("change", preference);
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => {
      disposed = true; stop(); image.onload = null;
      window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave); window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference); fine.removeEventListener("change", preference);
      canvas.removeEventListener("webglcontextlost", contextLost);
      gl.deleteBuffer(buffer); gl.deleteTexture(texture); gl.deleteProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
    };
  }, []);
  return <canvas ref={canvasRef} className="living-meadow" aria-hidden="true" />;
}
