// Minimal WebAudio SFX — soft, playful. Lazy after a gesture.
export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;
  constructor() { try { this.enabled = localStorage.getItem("stiffy_muted") !== "1"; } catch { /* */ } }
  private ac(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { this.enabled = false; return null; } }
    return this.ctx;
  }
  private blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime; const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
  }
  private noise(dur: number, filt: number, vol: number) {
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime; const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filt;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.02);
  }
  setEnabled(b: boolean) { this.enabled = b; try { localStorage.setItem("stiffy_muted", b ? "0" : "1"); } catch { /* */ } }

  drop() { this.blip(300, 0.12, "sine", 0.05, 640); }                    // whoosh up
  land(n = 0) { this.noise(0.08, 900, 0.06); this.blip(200 + Math.min(12, n) * 30, 0.1, "triangle", 0.05); } // thud + rising pitch per floor
  wobble() { this.blip(160, 0.2, "sine", 0.04, 120); }
  cheer() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.blip(f, 0.12, "triangle", 0.05), i * 70)); }
  start() { [392, 523, 659, 880].forEach((f, i) => setTimeout(() => this.blip(f, 0.12, "square", 0.05), i * 70)); }
  over() { this.blip(330, 0.4, "sawtooth", 0.06, 110); this.noise(0.3, 500, 0.05); }
  click() { this.blip(560, 0.04, "square", 0.04, 720); }
}
let _sfx: Sfx | null = null;
export function getSfx(): Sfx { if (!_sfx) _sfx = new Sfx(); return _sfx; }
