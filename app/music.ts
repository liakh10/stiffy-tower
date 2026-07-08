// Procedural music — a light, airy "up in the clouds" loop (soft pad + gentle
// pentatonic bells), built live with WebAudio. Started by a user gesture.

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  playing = false;
  muted = false;
  private step = 0;
  private readonly notes = [523.25, 587.33, 659.25, 783.99, 880.0, 659.25, 587.33, 783.99];

  private ensure(): boolean {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.0001;
      this.master.connect(this.ctx.destination);
      return true;
    } catch { return false; }
  }

  private pad() {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    [130.81, 196.0, 261.63].forEach((f) => {
      const o = this.ctx!.createOscillator(); const g = this.ctx!.createGain();
      o.type = "sine"; o.frequency.value = f; g.gain.value = 0.045;
      o.connect(g); g.connect(this.master!); o.start(t);
    });
  }

  private tick = () => {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const f = this.notes[this.step % this.notes.length];
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 1.2);
    this.step++;
  };

  play() {
    if (!this.ensure() || !this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), this.ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.85, this.ctx.currentTime + 1.8);
    this.pad(); this.tick();
    this.timer = window.setInterval(this.tick, 460);
  }

  pause() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5); }
  }

  toggle() { if (this.playing) this.pause(); else this.play(); }
  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) { this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.exponentialRampToValueAtTime(m ? 0.0001 : 0.85, this.ctx.currentTime + 0.3); }
  }
  dispose() { this.pause(); try { this.ctx?.close(); } catch { /* */ } this.ctx = null; }
}

let _music: MusicEngine | null = null;
export function getMusic(): MusicEngine {
  if (!_music) {
    _music = new MusicEngine();
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { __music?: MusicEngine }).__music = _music;
  }
  return _music;
}
