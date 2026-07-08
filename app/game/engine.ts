// Stiffy Tower — physics stacker on matter-js. Drop pieces onto a pedestal, build
// as high as you can; the tower wobbles and can topple. We own the rendering; the
// engine only simulates and exposes body transforms + game state.
import Matter from "matter-js";

type Phase = "idle" | "aiming" | "dropping" | "over";
export interface BodyView { x: number; y: number; angle: number; }
export interface Hud { phase: Phase; floors: number; height: number; best: number; }

const PW = 76;          // piece width
const PH = 92;          // piece height
const GAP = 160;        // spawn gap above the tower top
const KILL = 150;       // world-y below pedestal top = fell off
const PED_W = PW * 2.1; // pedestal (visual + physics) width

export class Game {
  w = 700; h = 560;
  phase: Phase = "idle";
  floors = 0; best = 0; height = 0;
  ghostX = 0; camY = 0; private displayCam = 0;
  readonly PW = PW; readonly PH = PH; readonly PED_W = PED_W;
  wobble = 0;

  private engine: Matter.Engine;
  private ground!: Matter.Body;
  private pieces: Matter.Body[] = [];
  private active: Matter.Body | null = null;
  private airTime = 0;
  private towerTop = 0;   // world y of highest resting piece (0 = pedestal top)
  onChange?: () => void; emit?: (k: string, n?: number) => void;

  constructor() {
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 1;
    if (typeof window !== "undefined") { try { this.best = Number(localStorage.getItem("stiffy_floors") || "0") || 0; } catch { /* */ } }
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __game?: Game }).__game = this;
  }

  resize(w: number, h: number) { this.w = w; this.h = h; this.ghostX = w / 2; }
  hud(): Hud { return { phase: this.phase, floors: this.floors, height: this.height, best: this.best }; }
  bodies(): BodyView[] { return this.pieces.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle })); }
  spawnY(): number { return this.towerTop - GAP; }
  pedTopScreen(): number { return this.toScreenY(0); }
  toScreenY(worldY: number): number { return worldY - this.displayCam; }

  start() {
    Matter.World.clear(this.engine.world, false);
    this.pieces = []; this.active = null; this.floors = 0; this.height = 0; this.towerTop = 0; this.airTime = 0;
    // pedestal: static, top surface at world y=0, extends down (visual base too)
    this.ground = Matter.Bodies.rectangle(this.w / 2, 220, PED_W, 440, { isStatic: true, friction: 0.95, label: "ground" });
    Matter.World.add(this.engine.world, this.ground);
    this.ghostX = this.w / 2;
    this.displayCam = this.spawnY() - this.h * 0.16;
    this.camY = this.displayCam;
    this.phase = "aiming";
    this.onChange?.();
  }

  moveGhost(x: number) { if (this.phase === "aiming") this.ghostX = Math.max(PW / 2 + 6, Math.min(this.w - PW / 2 - 6, x)); }

  drop() {
    if (this.phase !== "aiming") return;
    const b = Matter.Bodies.rectangle(this.ghostX, this.spawnY(), PW, PH, {
      chamfer: { radius: 18 }, friction: 0.7, frictionStatic: 0.9, restitution: 0.02, density: 0.0022,
    });
    Matter.World.add(this.engine.world, b);
    this.pieces.push(b); this.active = b; this.airTime = 0; this.phase = "dropping";
    this.emit?.("drop"); this.onChange?.();
  }

  private settleActive() {
    const b = this.active!;
    if (b.position.y > KILL) { this.gameOver(); return; }         // fell off
    // counted floor
    this.floors += 1;
    this.towerTop = Math.min(...this.pieces.map((p) => p.bounds.min.y));
    this.height = Math.max(0, Math.round((0 - this.towerTop) / 6));
    this.best = Math.max(this.best, this.floors);
    try { if (this.floors > (Number(localStorage.getItem("stiffy_floors") || "0") || 0)) localStorage.setItem("stiffy_floors", String(this.floors)); } catch { /* */ }
    this.active = null; this.phase = "aiming";
    this.emit?.("land", this.floors);
    if (this.floors > 0 && this.floors % 5 === 0) this.emit?.("cheer");
    this.onChange?.();
  }

  private gameOver() {
    this.phase = "over"; this.active = null;
    try { if (this.floors > (Number(localStorage.getItem("stiffy_floors") || "0") || 0)) localStorage.setItem("stiffy_floors", String(this.floors)); } catch { /* */ }
    try { const bh = Number(localStorage.getItem("stiffy_height") || "0") || 0; if (this.height > bh) localStorage.setItem("stiffy_height", String(this.height)); } catch { /* */ }
    this.emit?.("over"); this.onChange?.();
  }

  update(dtMs: number) {
    const dt = Math.min(34, dtMs);
    if (this.phase === "dropping" || this.phase === "aiming" || this.phase === "over") {
      Matter.Engine.update(this.engine, dt);
    }
    if (this.phase === "dropping" && this.active) {
      this.airTime += dt / 1000;
      const b = this.active;
      if (b.position.y > KILL) { this.gameOver(); }
      else if (this.airTime > 0.25 && b.speed < 0.45 && b.angularSpeed < 0.05) { this.settleActive(); }
    }
    // any resting piece knocked off the stack => topple
    if (this.phase === "aiming") {
      for (const p of this.pieces) { if (p.position.y > KILL) { this.gameOver(); break; } }
      // wobble meter: how tilted is the top piece
      const top = this.pieces[this.pieces.length - 1];
      this.wobble = top ? Math.min(1, Math.abs(Math.sin(top.angle)) * 2.2) : 0;
    }
    // camera follow (keep spawn line near the top)
    const target = this.spawnY() - this.h * 0.16;
    this.displayCam += (target - this.displayCam) * Math.min(1, dt / 1000 * 4);
    this.camY = this.displayCam;
    this.onChange?.();
  }

  // ── dev helpers ──
  debugDrop(x?: number) { if (this.phase === "aiming") { this.moveGhost(x ?? this.w / 2); this.drop(); } }
  debugStep(ms = 16, n = 1) { for (let i = 0; i < n; i++) this.update(ms); }
  debugKnockOff() { const p = this.pieces[this.pieces.length - 1]; if (p) Matter.Body.setPosition(p, { x: p.position.x, y: KILL + 60 }); }

  dispose() { Matter.World.clear(this.engine.world, false); Matter.Engine.clear(this.engine); this.pieces = []; }
}
