"use client";

import { useEffect, useRef, useState } from "react";
import { Game, type Hud } from "./engine";
import { Ruler, Trophy } from "../art/icons";
import { getMusic } from "../music";
import { getSfx } from "../sfx";

const IDLE: Hud = { phase: "idle", floors: 0, height: 0, best: 0 };
const CLOUDS = [
  { x: 0.2, y: -40, s: 1 }, { x: 0.78, y: -260, s: 0.8 }, { x: 0.45, y: -520, s: 1.1 },
  { x: 0.14, y: -760, s: 0.9 }, { x: 0.82, y: -1040, s: 1 }, { x: 0.5, y: -1320, s: 0.85 },
];

export default function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const [hud, setHud] = useState<Hud>(IDLE);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const game = new Game(); gameRef.current = game;
    game.emit = (k, n) => {
      const s = getSfx();
      if (k === "drop") s.drop(); else if (k === "land") s.land(n); else if (k === "cheer") s.cheer();
      else if (k === "over") { s.over(); window.dispatchEvent(new Event("stiffy:update")); }
    };
    setHud(game.hud());

    const sprite = new Image(); sprite.src = "/dude.png"; spriteRef.current = sprite;

    let dpr = 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      game.resize(r.width, r.height);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);

    let last = "";
    const syncHud = () => { const h = game.hud(); const key = `${h.phase}|${h.floors}|${h.height}|${h.best}`; if (key !== last) { last = key; setHud(h); } };

    const draw = () => {
      const w = game.w, h = game.h;
      // sky
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#bfe3ff"); g.addColorStop(0.7, "#e6f4ff"); g.addColorStop(1, "#f4fbff");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // clouds (parallax)
      ctx.fillStyle = "#ffffff";
      for (const c of CLOUDS) {
        const sy = c.y - game.camY * 0.5; const yy = ((sy % (h + 400)) + (h + 400)) % (h + 400) - 200;
        cloud(ctx, c.x * w, yy, 46 * c.s);
      }
      const sprite = spriteRef.current;
      // pedestal
      const pedTop = game.toScreenY(0);
      ctx.fillStyle = "#8ecae6"; ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 4;
      roundRect(ctx, w / 2 - game.PED_W / 2, pedTop, game.PED_W, h - pedTop + 40, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(w / 2 - game.PED_W / 2 + 8, pedTop + 8, game.PED_W - 16, 10);
      // pieces
      if (sprite && sprite.complete) {
        for (const b of game.bodies()) {
          ctx.save(); ctx.translate(b.x, game.toScreenY(b.y)); ctx.rotate(b.angle);
          const dw = game.PW * 1.5, dh = game.PW * 1.5;
          ctx.drawImage(sprite, -dw / 2, -dh / 2, dw, dh); ctx.restore();
        }
        // ghost
        if (game.phase === "aiming") {
          const gy = game.toScreenY(game.spawnY());
          ctx.strokeStyle = "rgba(26,26,26,0.25)"; ctx.setLineDash([6, 8]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(game.ghostX, gy + 30); ctx.lineTo(game.ghostX, h); ctx.stroke(); ctx.setLineDash([]);
          ctx.globalAlpha = 0.85; const dw = game.PW * 1.5;
          ctx.drawImage(sprite, game.ghostX - dw / 2, gy - dw / 2, dw, dw); ctx.globalAlpha = 1;
        }
      }
      // ruler on the right
      ctx.strokeStyle = "#1a1a1a"; ctx.fillStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.font = "11px var(--font-mono), monospace";
      for (let m = 0; m <= 60; m++) {
        const wy = -m * 30; const sy = game.toScreenY(wy); if (sy < -20 || sy > h + 20) continue;
        const long = m % 5 === 0; ctx.beginPath(); ctx.moveTo(w - (long ? 22 : 12), sy); ctx.lineTo(w - 2, sy); ctx.stroke();
        if (long) { ctx.fillText(String(m * 5), w - 46, sy + 4); }
      }
    };

    let raf = 0, prev = performance.now();
    const loop = (now: number) => {
      const dt = now - prev; prev = now;
      game.update(dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
      syncHud();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const px = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return e.clientX - r.left; };
    const move = (e: PointerEvent) => game.moveGhost(px(e));
    const up = (e: PointerEvent) => { game.moveGhost(px(e)); game.drop(); };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up);
      game.dispose();
    };
  }, []);

  const start = () => { getSfx().start(); try { getMusic().play(); } catch { /* */ } gameRef.current?.start(); setHud(gameRef.current?.hud() ?? IDLE); };

  return (
    <div className="game">
      <div className="game-hud">
        <div className="hud-floors"><b>{hud.floors}</b> floors</div>
        <div className="hud-height"><Ruler size={16} /> {hud.height} cm</div>
        <div className="hud-best"><Trophy size={15} /> {hud.best}</div>
      </div>

      <div className="game-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="game-canvas" />
        {hud.phase === "idle" && (
          <div className="game-overlay">
            <h3>Stack &apos;em sky-high</h3>
            <p>Move, tap to drop. Balance the tower. Don&apos;t let it topple.</p>
            <button className="btn btn-pink btn-lg" onClick={start}>Start stacking</button>
          </div>
        )}
        {hud.phase === "over" && (
          <div className="game-overlay">
            <h3>Timber!</h3>
            <div className="over-row"><span><b>{hud.floors}</b> floors</span><span>{hud.height} cm tall</span></div>
            <p className="over-best">{hud.floors >= hud.best && hud.floors > 0 ? "new record!" : `best ${hud.best} floors`}</p>
            <button className="btn btn-pink btn-lg" onClick={start}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7); ctx.arc(x + r * 0.9, y + 6, r * 0.75, 0, 7); ctx.arc(x - r * 0.9, y + 6, r * 0.7, 0, 7); ctx.arc(x, y + 10, r * 0.9, 0, 7);
  ctx.fill();
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
