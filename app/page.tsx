"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CA, TICKER, X_URL, PUMP_URL, DEX_URL, isRealCA } from "./config";
import { XIcon, Trophy, Ruler } from "./art/icons";
import { getSfx } from "./sfx";
import { getMusic } from "./music";
import { getBestFloors, getBestHeight } from "./store";
import Enter from "./Enter";

const GameCanvas = dynamic(() => import("./game/GameCanvas"), { ssr: false });

const NAV = [
  { href: "#play", label: "Play" },
  { href: "#how", label: "How" },
  { href: "#notes", label: "Notes" },
  { href: "/docs", label: "Docs" },
];

const HOW = [
  ["Move", "Slide left and right — the next piece follows your cursor or finger."],
  ["Drop", "Tap or click to let go. It falls with real physics onto the tower."],
  ["Balance", "Stack straight and it holds. Off-centre stacks wobble — and can topple."],
];

const NOTES = [
  { h: "wtf is this", b: "A physics stacker starring the boys. Drop them one on top of another, chase height, watch it all fall down eventually. That's the game." },
  { h: "the boys", b: "One shape, infinite stacking. $STIFFY is the house coin for this — fair launch on Solana, no utility beyond bragging rights on the leaderboard in your own browser." },
  { h: "gravity is undefeated", b: "Every tower falls eventually. The only question is how many floors you get first." },
];

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CABlock() {
  const [copied, setCopied] = useState(false);
  const real = isRealCA();
  const copy = () => navigator.clipboard?.writeText(CA).then(() => { setCopied(true); getSfx().click(); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className="ca">
      <span className="ca-label">CA</span>
      <code className="ca-value">{real ? CA : "SOON"}</code>
      {real && <button className="ca-copy" onClick={copy}>{copied ? "copied" : "copy"}</button>}
    </div>
  );
}

function BuyLinks({ small }: { small?: boolean }) {
  const cls = small ? "btn btn-sm" : "btn";
  return (
    <div className="buy">
      <a className={`${cls} btn-pink`} href={isRealCA() ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
      <a className={`${cls} btn-outline`} href={isRealCA() ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
    </div>
  );
}

function HallOfFame() {
  const [floors, setFloors] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const refresh = () => { setFloors(getBestFloors()); setHeight(getBestHeight()); };
    refresh();
    window.addEventListener("stiffy:update", refresh);
    window.addEventListener("stiffy:awake", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("stiffy:update", refresh); window.removeEventListener("stiffy:awake", refresh); window.removeEventListener("focus", refresh); };
  }, []);
  return (
    <div className="fame">
      <div className="fame-card reveal"><Trophy size={28} /><b>{floors}</b><span>best floors</span></div>
      <div className="fame-card reveal"><Ruler size={26} /><b>{height} cm</b><span>tallest tower</span></div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    const onAwake = () => setMutedState(getMusic().muted);
    window.addEventListener("stiffy:awake", onAwake);
    return () => window.removeEventListener("stiffy:awake", onAwake);
  }, []);
  const toggleMute = () => { const m = !muted; setMutedState(m); getMusic().setMuted(m); getSfx().setEnabled(!m); if (!m) getMusic().play(); };

  return (
    <>
      <Enter />
      <main>
        <header className="nav">
          <a href="#top" className="brand"><Image src="/x-avatar.png" alt="" width={26} height={26} className="brand-mascot" style={{ borderRadius: "50%", objectFit: "cover" }} /> <b>Stiffy Tower</b> <span className="brand-ticker">{TICKER}</span></a>
          <nav className="nav-links">{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleMute} title="sound">{muted ? "off" : "on"}</button>
            <a href={X_URL} target="_blank" rel="noreferrer" className="icon-btn" aria-label="X"><XIcon size={15} /></a>
            <a href="#play" className="btn btn-pink btn-sm">Play</a>
          </div>
        </header>

        <section id="top" className="hero">
          <span className="pill reveal">a very stiff physics toy · on Solana</span>
          <h1 className="hero-title reveal">STIFFY TOWER</h1>
          <p className="hero-sub reveal">Stack the boys as high as you can. Real physics, real wobble, real downfall.</p>

          {/* static avatar — never animated, per house rule */}
          <div className="hero-avatar reveal"><Image src="/dude.png" alt="Stiffy Tower mascot" width={150} height={150} priority /></div>

          <div id="play" className="reveal"><GameCanvas /></div>
          <div className="hero-token reveal"><CABlock /><BuyLinks small /></div>
        </section>

        <section id="how" className="section">
          <div className="section-head reveal"><span className="pill">How to play</span><h2 className="section-title">Move. Drop. Don&apos;t tip.</h2></div>
          <div className="how">
            {HOW.map(([h, b], i) => (
              <div className="how-item reveal" key={h}><span className="how-n">{i + 1}</span><h3>{h}</h3><p>{b}</p></div>
            ))}
          </div>
        </section>

        <section id="fame" className="section section-fame">
          <div className="section-head reveal"><span className="pill">Hall of Fame</span><h2 className="section-title">Your records</h2><p className="section-lead">Saved right here on your device. Beat them.</p></div>
          <HallOfFame />
        </section>

        <section id="notes" className="section">
          <div className="section-head reveal"><span className="pill">Notes</span><h2 className="section-title">The fine print</h2></div>
          <div className="notes-wall">
            {NOTES.map((n, i) => <article className={`note note-${i % 3} reveal`} key={n.h}><h3>{n.h}</h3><p>{n.b}</p></article>)}
          </div>
        </section>

        <footer className="footer">
          <div className="footer-top reveal">
            <a href="#top" className="brand"><Image src="/x-avatar.png" alt="" width={24} height={24} className="brand-mascot" style={{ borderRadius: "50%", objectFit: "cover" }} /> <b>Stiffy Tower</b></a>
            <div className="footer-links"><a href="#play">Play</a><a href="#how">How</a><a href="#notes">Notes</a><a href="/docs">Docs</a><a href={X_URL} target="_blank" rel="noreferrer" className="footer-x"><XIcon size={14} /> X</a></div>
          </div>
          <div className="footer-buy reveal"><CABlock /><BuyLinks small /></div>
          <p className="footer-bottom">© {new Date().getFullYear()} {TICKER} · stack responsibly</p>
        </footer>
      </main>
    </>
  );
}
