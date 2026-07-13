"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CA, TICKER, PUMP_URL, DEX_URL, isRealCA } from "../config";

const SECTIONS = [
  { id: "overview", label: "What is Stiffy Tower?" },
  { id: "controls", label: "Gameplay & Controls" },
  { id: "physics", label: "Physics & Wobble" },
  { id: "scoring", label: "Floors & Height" },
  { id: "token", label: `${TICKER} Token` },
  { id: "local", label: "Local & Free" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="docs-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function DocsContent() {
  const [active, setActive] = useState("overview");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const s of SECTIONS) { const el = refs.current[s.id]; if (el) io.observe(el); }
    return () => io.disconnect();
  }, []);

  const real = isRealCA();

  return (
    <>
      <header className="nav">
        <Link href="/#top" className="brand"><Image src="/dude.png" alt="" width={26} height={26} className="brand-mascot" /> <b>Stiffy Tower</b> <span className="brand-ticker">{TICKER}</span></Link>
        <nav className="nav-links">
          <Link href="/#play">Play</Link>
          <Link href="/#how">How</Link>
          <Link href="/#notes">Notes</Link>
          <span className="docs-nav-crumb">Docs</span>
        </nav>
        <div className="nav-actions">
          <Link href="/#play" className="btn btn-pink btn-sm">Play</Link>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-side">
          <span className="docs-kicker">Field Manual</span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`docs-nav-link ${active === s.id ? "active" : ""}`}>{s.label}</a>
          ))}
        </aside>

        <main className="docs-main">
          <div className="docs-hero">
            <h1>Stiffy Tower Docs</h1>
            <p>Everything about the physics stacker, scoring, and {TICKER} — in one page.</p>
          </div>

          <section id="overview" ref={(el) => { refs.current.overview = el; }} className="docs-section">
            <h2>What is Stiffy Tower?</h2>
            <p>
              Stiffy Tower is a real-physics stacking game, playable instantly in the browser — no
              download, no signup. Drop one piece on top of the last, keep it centred, and see how many
              floors you can build before gravity wins.
            </p>
            <div className="docs-table">
              <Row label="Ticker">{TICKER} (Solana, fair launch)</Row>
              <Row label="Format">Single-player physics stacker, real rigid-body simulation (Matter.js)</Row>
              <Row label="Cost to play">Free, unlimited, no wallet required</Row>
            </div>
          </section>

          <section id="controls" ref={(el) => { refs.current.controls = el; }} className="docs-section">
            <h2>Gameplay & Controls</h2>
            <p>Three steps on loop: move, drop, hope it holds.</p>
            <div className="docs-table">
              <Row label="Move">Slide left/right (mouse, trackpad, or finger) — the next piece follows a ghost marker above the tower</Row>
              <Row label="Drop">Tap or click to let go — the piece falls with real physics onto the stack</Row>
              <Row label="Landing">A piece counts once it settles (low velocity, low spin) — it doesn&apos;t snap into place</Row>
              <Row label="Game over">Any piece — falling or resting — drops far enough below the pedestal</Row>
            </div>
          </section>

          <section id="physics" ref={(el) => { refs.current.physics = el; }} className="docs-section">
            <h2>Physics & Wobble</h2>
            <p>Every piece is a real rigid body — there&apos;s no invisible snapping or auto-alignment.</p>
            <div className="docs-table">
              <Row label="Simulation">Matter.js rigid-body physics — gravity, friction, restitution all apply per piece</Row>
              <Row label="Wobble meter">Tracks how tilted the top piece is — the more off-centre your stack, the higher it climbs</Row>
              <Row label="Toppling">An off-centre stack can tip and take pieces down with it — this isn&apos;t scripted, it&apos;s the simulation</Row>
              <Row label="Camera">Follows the tower top automatically as you climb</Row>
            </div>
          </section>

          <section id="scoring" ref={(el) => { refs.current.scoring = el; }} className="docs-section">
            <h2>Floors & Height</h2>
            <p>Two separate records, both about how far you got before the fall.</p>
            <div className="docs-table">
              <Row label="Floors">+1 for every piece that lands and settles on the stack</Row>
              <Row label="Height">Measured in on-screen cm from the pedestal to the highest resting piece</Row>
              <Row label="Best floors / best height">Both saved locally — only new records overwrite them</Row>
            </div>
          </section>

          <section id="token" ref={(el) => { refs.current.token = el; }} className="docs-section">
            <h2>{TICKER} Token</h2>
            <p>The game has no in-game currency or shop — {TICKER} is a separate community token that doesn&apos;t affect gameplay, piece shapes, or scoring in any way.</p>
            <div className="docs-table">
              <Row label="Contract">{real ? <code className="mono">{CA}</code> : "SOON — not launched yet"}</Row>
              <Row label="Launch style">Fair launch on Pump Fun, no presale, no team allocation</Row>
              <Row label="Buy links">
                <a href={real ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
                {" · "}
                <a href={real ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
              </Row>
            </div>
          </section>

          <section id="local" ref={(el) => { refs.current.local = el; }} className="docs-section">
            <h2>Local & Free</h2>
            <p>No backend, no account, no wallet gate on the game itself. Your records live only in this browser.</p>
            <div className="docs-table">
              <Row label="Storage">Best floors and best height saved to this browser&apos;s localStorage</Row>
              <Row label="Device-local">Clearing site data or switching browsers/devices resets your records</Row>
              <Row label="No leaderboard">Scores aren&apos;t submitted anywhere — the Hall of Fame is a personal record only</Row>
            </div>
            <p className="docs-note">Cross-device syncing, shared leaderboards, and any real-money mechanic are not built — see Roadmap below.</p>
          </section>

          <section id="roadmap" ref={(el) => { refs.current.roadmap = el; }} className="docs-section">
            <h2>Roadmap</h2>
            <div className="docs-table">
              <Row label="Live">Physics stacker, wobble/topple simulation, local best floors & height</Row>
              <Row label="Planned">New piece shapes, wind/obstacle events at higher floors</Row>
              <Row label="Token">{TICKER} fair launch — CA appears here and on the buy links the moment it&apos;s live</Row>
            </div>
          </section>

          <section id="faq" ref={(el) => { refs.current.faq = el; }} className="docs-section">
            <h2>FAQ</h2>
            <dl className="docs-faq">
              <dt>Do I need a wallet to play?</dt>
              <dd>No. Stiffy Tower is fully playable free, with no connection of any kind.</dd>
              <dt>Why did my tower fall even though it looked centred?</dt>
              <dd>It&apos;s a real physics simulation — small offsets compound as you stack higher, just like a real tower.</dd>
              <dt>Is {TICKER} live yet?</dt>
              <dd>Not yet. The contract address on this page reads &quot;SOON&quot; until it launches.</dd>
              <dt>Can a piece un-count after it lands?</dt>
              <dd>No — once a floor is counted it stays counted, even if the tower topples afterward.</dd>
            </dl>
          </section>
        </main>
      </div>
    </>
  );
}
