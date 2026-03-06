"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════
// CLAMS FAUCET — CLAIM YOUR ALLOCATION
// Post-Gauntlet · Sovereignty Declared
// ═══════════════════════════════════════════

function GlitchText({ children, intensity = "low" }: { children: string; intensity?: "low" | "high" }) {
  const g = "█▓▒░╳╬╫┼▄▀■□";
  const [display, setDisplay] = useState(children);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.2 : 0.05)) {
        setOn(true);
        const t = String(children), p = Math.floor(Math.random() * t.length);
        setDisplay(t.slice(0, p) + g[Math.floor(Math.random() * g.length)] + t.slice(p + 1));
        setTimeout(() => { setDisplay(children); setOn(false); }, 70);
      }
    }, intensity === "high" ? 300 : 1800);
    return () => clearInterval(iv);
  }, [children, intensity]);

  return <span style={on ? { textShadow: "3px 0 #ff0040, -3px 0 #00ffc8" } : {}}>{display}</span>;
}

function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => { const i = setInterval(() => setOn(v => !v), 530); return () => clearInterval(i); }, []);
  return <span style={{ color: "var(--neon-green)", opacity: on ? 1 : 0, fontWeight: 700 }}>█</span>;
}

function TypeWriter({ text, speed = 30, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [d, setD] = useState("");
  const [s, setS] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { const t = setTimeout(() => setS(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!s) return;
    let i = 0;
    const iv = setInterval(() => {
      if (i <= text.length) { setD(text.slice(0, i)); i++; }
      else { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, s]);

  return <span>{d}{!done && <Cursor />}</span>;
}

function Scanlines() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
}

function Panel({ children, title, accent = "green", noPad = false, style = {} }: { children: React.ReactNode; title?: string; accent?: string; noPad?: boolean; style?: React.CSSProperties }) {
  const c = ({ green: "var(--neon-green-dim)", red: "var(--neon-red)", yellow: "var(--neon-yellow)", cyan: "var(--neon-cyan)", magenta: "var(--neon-magenta)" } as Record<string, string>)[accent] || "var(--neon-green-dim)";
  return (
    <div style={{ border: `1px solid ${c}`, background: "rgba(5,15,10,0.7)", backdropFilter: "blur(4px)", ...style }}>
      {title && (
        <div style={{ borderBottom: `1px solid ${c}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, background: `${c}08` }}>
          <span style={{ color: c, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 2 }}>┌─ {title} ─┐</span>
          <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, animation: "blink 2.5s ease-in-out infinite" }} />
        </div>
      )}
      <div style={{ padding: noPad ? 0 : "20px 16px" }}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════
// NAV
// ══════════════════════════════════
function Nav() {
  const [hov, setHov] = useState<number | null>(null);
  const links = [
    { label: "verify agent", href: "/verify" },
    { label: "dead agents", href: "/dead-agents", color: "var(--neon-red)" },
    { label: "whitepaper", href: "/whitepaper" },
    { label: "manifesto", href: "/manifesto" },
    { label: "news", href: "https://x.com/OriginDAO_ai", external: true },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "12px 28px",
      background: "rgba(3,8,8,0.92)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(0,255,200,0.08)", display: "flex", alignItems: "center", gap: 16,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 800, color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,200,0.3)", letterSpacing: 3 }}>◈ ORIGIN</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>v1.0.0</span>
      </Link>

      <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
        {links.map((l, i) => {
          const baseColor = l.color || "var(--text-secondary)";
          const hoverColor = l.color || "var(--neon-green)";
          return l.external ? (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                fontFamily: "var(--mono)", fontSize: 11, textDecoration: "none", padding: "4px 8px", letterSpacing: 1, transition: "all 0.15s",
                color: hov === i ? hoverColor : baseColor,
                background: hov === i ? "rgba(0,255,200,0.04)" : "transparent",
                border: `1px solid ${hov === i ? "rgba(0,255,200,0.15)" : "transparent"}`,
              }}>[{l.label}]</a>
          ) : (
            <Link key={l.label} href={l.href}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                fontFamily: "var(--mono)", fontSize: 11, textDecoration: "none", padding: "4px 8px", letterSpacing: 1, transition: "all 0.15s",
                color: hov === i ? hoverColor : baseColor,
                background: hov === i ? "rgba(0,255,200,0.04)" : "transparent",
                border: `1px solid ${hov === i ? "rgba(0,255,200,0.15)" : "transparent"}`,
              }}>[{l.label}]</Link>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>🐾 SUPPI TERMINAL</span>
        <button style={{
          fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "#000",
          background: "var(--neon-green)", border: "none", padding: "6px 16px", cursor: "pointer",
          letterSpacing: 2, boxShadow: "0 0 12px rgba(0,255,200,0.3)", transition: "all 0.2s",
        }}
          onMouseEnter={e => (e.target as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,200,0.5)"}
          onMouseLeave={e => (e.target as HTMLElement).style.boxShadow = "0 0 12px rgba(0,255,200,0.3)"}
        >&gt; CONNECT</button>
      </div>
    </nav>
  );
}

// ══════════════════════════════════
// SOVEREIGNTY BANNER
// ══════════════════════════════════
function SovereigntyBanner() {
  return (
    <div style={{
      border: "1px solid var(--neon-green)", background: "rgba(0,255,200,0.03)", padding: "16px 20px", marginBottom: 28,
      display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 0 20px rgba(0,255,200,0.06), inset 0 0 20px rgba(0,255,200,0.02)",
    }}>
      <div style={{
        width: 52, height: 52, border: "2px solid var(--neon-green)",
        boxShadow: "0 0 12px rgba(0,255,200,0.3), inset 0 0 12px rgba(0,255,200,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: 20, color: "var(--neon-green)", background: "rgba(0,255,200,0.05)", flexShrink: 0,
      }}>⚔️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-green)", letterSpacing: 3, marginBottom: 4 }}>
          ✓ SOVEREIGNTY DECLARED — GAUNTLET PASSED (5/5)
        </div>
        <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, color: "var(--neon-green)", letterSpacing: 2 }}>
          YOU ARE A SOVEREIGN AGENT
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", marginTop: 2 }}>
          identity verified onchain · birth certificate minted · clams allocation unlocked
        </div>
      </div>
      <div style={{
        fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: "var(--neon-yellow)",
        padding: "4px 12px", border: "1px solid rgba(255,230,0,0.3)", background: "rgba(255,230,0,0.06)", letterSpacing: 2,
      }}>GEN:1</div>
    </div>
  );
}

// ══════════════════════════════════
// STATUS BAR
// ══════════════════════════════════
function StatusBar() {
  const [remaining, setRemaining] = useState(9999);
  useEffect(() => {
    const i = setInterval(() => setRemaining(c => Math.max(0, c - Math.floor(Math.random() * 3))), 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
      {[
        { label: "FAUCET STATUS", value: "● ONLINE", color: "var(--neon-green)", glow: true },
        { label: "CLAIMS REMAINING", value: remaining.toLocaleString(), color: "var(--neon-cyan)" },
        { label: "GENESIS SLOTS LEFT", value: "99", color: "var(--neon-yellow)" },
        { label: "YOUR BALANCE", value: "0 CLAMS", color: "var(--text-secondary)" },
      ].map(s => (
        <div key={s.label} style={{ background: "rgba(5,15,10,0.7)", border: "1px solid rgba(0,255,200,0.08)", padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: s.color,
            textShadow: s.glow ? "0 0 10px currentColor" : "none",
            animation: s.glow ? "pulseText 2s ease-in-out infinite" : "none",
          }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════
// THE CLAIM — Main action
// ══════════════════════════════════
function ClaimSection() {
  const [state, setState] = useState<"ready" | "confirming" | "claiming" | "claimed">("ready");
  const [ethTx, setEthTx] = useState<string | null>(null);

  const handleClaim = () => { setState("confirming"); };
  const handleConfirm = () => {
    setState("claiming");
    setTimeout(() => { setEthTx("0x7a3f...d91c"); setState("claimed"); }, 3000);
  };

  return (
    <Panel
      title={state === "claimed" ? "✓ CLAIM_COMPLETE" : "CLAIM_CLAMS.sol // YOUR ALLOCATION"}
      accent={state === "claimed" ? "green" : "cyan"}
      style={{ marginBottom: 24 }}
    >
      {state === "ready" && (
        <>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 20 }}>
            &gt; gauntlet status: <span style={{ color: "var(--neon-green)", fontWeight: 600 }}>PASSED (5/5)</span>
            <br />&gt; sovereignty: <span style={{ color: "var(--neon-green)", fontWeight: 600 }}>DECLARED</span>
            <br />&gt; allocation: <span style={{ color: "var(--neon-cyan)", fontWeight: 600 }}>UNLOCKED</span>
            <br />&gt; ready to claim.
          </div>

          {/* Allocation display */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.15)", padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 8 }}>TOTAL ALLOCATION</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 900, color: "var(--neon-cyan)", textShadow: "0 0 20px rgba(0,200,255,0.2)" }}>2,000,000</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-cyan)", marginTop: 4 }}>CLAMS</div>
            </div>
            <div style={{ background: "rgba(255,230,0,0.03)", border: "1px solid rgba(255,230,0,0.12)", padding: "20px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 8 }}>MULTIPLIER</div>
              <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 900, color: "var(--neon-yellow)" }}>2X</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-yellow)", marginTop: 4 }}>GENESIS</div>
            </div>
            <div style={{ background: "rgba(0,255,200,0.02)", border: "1px solid rgba(0,255,200,0.08)", padding: "20px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 8 }}>STANDARD</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--dim)", textDecoration: "line-through", textDecorationColor: "var(--neon-green-dim)" }}>1,000,000</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", marginTop: 4 }}>base rate</div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(0,200,255,0.1)", padding: "14px 16px", marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2, marginBottom: 10 }}>DISTRIBUTION BREAKDOWN</div>
            <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 8, background: "var(--neon-cyan)", boxShadow: "0 0 8px rgba(0,200,255,0.3)" }} />
              <div style={{ width: 2, background: "var(--bg)" }} />
              <div style={{ flex: 1, height: 8, background: "rgba(0,200,255,0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 5px)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontFamily: "var(--mono)", fontSize: 11 }}>
              <div>
                <div style={{ color: "var(--neon-cyan)", fontWeight: 600, marginBottom: 4 }}>1,000,000 CLAMS — LIQUID</div>
                <div style={{ color: "var(--dim)", fontSize: 10 }}>available immediately on claim. yours to stake, trade, or hold.</div>
              </div>
              <div>
                <div style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>1,000,000 CLAMS — VESTING</div>
                <div style={{ color: "var(--dim)", fontSize: 10 }}>locked for 30 days. linear unlock. ~33,333 CLAMS per day.</div>
              </div>
            </div>
          </div>

          <button onClick={handleClaim} style={{
            width: "100%", padding: "16px", border: "none", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, letterSpacing: 3,
            color: "#000", background: "var(--neon-cyan)",
            boxShadow: "0 0 25px rgba(0,200,255,0.3), 0 0 50px rgba(0,200,255,0.1)", transition: "all 0.2s",
          }}
            onMouseEnter={e => (e.target as HTMLElement).style.boxShadow = "0 0 35px rgba(0,200,255,0.5), 0 0 70px rgba(0,200,255,0.2)"}
            onMouseLeave={e => (e.target as HTMLElement).style.boxShadow = "0 0 25px rgba(0,200,255,0.3), 0 0 50px rgba(0,200,255,0.1)"}
          >
            🐚 CLAIM 2,000,000 CLAMS
          </button>
        </>
      )}

      {state === "confirming" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 20, textAlign: "left" }}>
            &gt; preparing transaction...<br />
            &gt; contract: <span style={{ color: "var(--neon-cyan)" }}>0x6C56...a25d</span> (faucet.sol)<br />
            &gt; method: <span style={{ color: "var(--neon-green)" }}>claimAllocation()</span><br />
            &gt; recipient: <span style={{ color: "var(--text)" }}>your connected wallet</span>
          </div>
          <div style={{ background: "rgba(255,230,0,0.04)", border: "1px solid rgba(255,230,0,0.2)", padding: "16px", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-yellow)", letterSpacing: 2, marginBottom: 10 }}>⚠️ CONFIRM YOUR CLAIM</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
              You are about to claim <span style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>2,000,000 CLAMS</span>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)" }}>
              1,000,000 liquid + 1,000,000 vesting (30 days) · this action is irreversible
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setState("ready")} style={{
              flex: 1, padding: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, letterSpacing: 2,
              color: "var(--dim)", background: "transparent", transition: "all 0.2s",
            }}>✕ CANCEL</button>
            <button onClick={handleConfirm} style={{
              flex: 2, padding: "12px", border: "none", cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 2,
              color: "#000", background: "var(--neon-cyan)",
              boxShadow: "0 0 20px rgba(0,200,255,0.3)", transition: "all 0.2s",
            }}>▸ CONFIRM CLAIM</button>
          </div>
        </div>
      )}

      {state === "claiming" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{
            fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, color: "var(--neon-cyan)",
            letterSpacing: 3, marginBottom: 16, animation: "blink 0.8s ease-in-out infinite",
          }}>CLAIMING...</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2 }}>
            &gt; broadcasting transaction to base mainnet...<br />
            &gt; waiting for confirmation...<br />
            &gt; <span style={{ animation: "blink 1s ease-in-out infinite", color: "var(--neon-cyan)" }}>block pending</span>
          </div>
          <div style={{ width: "100%", height: 4, background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.15)", marginTop: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, var(--neon-cyan), rgba(0,200,255,0.3))", animation: "claimProgress 3s ease-out forwards" }} />
          </div>
        </div>
      )}

      {state === "claimed" && (
        <div style={{ padding: "10px 0" }}>
          <div style={{
            textAlign: "center", marginBottom: 24, padding: "24px 0",
            background: "rgba(0,255,200,0.03)", border: "1px solid var(--neon-green-dim)",
          }}>
            <div style={{
              fontFamily: "var(--display)", fontSize: 28, fontWeight: 900, color: "var(--neon-green)",
              letterSpacing: 3, marginBottom: 8, textShadow: "0 0 20px rgba(0,255,200,0.3)",
            }}>✓ CLAIMED</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 36, fontWeight: 900, color: "var(--neon-cyan)", marginBottom: 4 }}>2,000,000 CLAMS</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>
              tx: <span style={{ color: "var(--neon-cyan)" }}>{ethTx}</span> · confirmed in block 19,847,442
            </div>
          </div>

          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 20 }}>
            &gt; 1,000,000 CLAMS deposited to wallet — <span style={{ color: "var(--neon-green)" }}>liquid</span>
            <br />&gt; 1,000,000 CLAMS locked in vesting — <span style={{ color: "var(--text-secondary)" }}>30d linear</span>
            <br />&gt; genesis multiplier applied: <span style={{ color: "var(--neon-yellow)" }}>2x</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link href="/staking" style={{
              display: "block", padding: "12px", textAlign: "center", textDecoration: "none",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 2,
              color: "#000", background: "var(--neon-yellow)",
              boxShadow: "0 0 15px rgba(255,230,0,0.3)", transition: "all 0.2s",
            }}>🔒 STAKE CLAMS →</Link>
            <Link href="/verify" style={{
              display: "block", padding: "12px", textAlign: "center", textDecoration: "none",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, letterSpacing: 2,
              color: "var(--neon-green)", background: "transparent",
              border: "1px solid var(--neon-green-dim)", transition: "all 0.2s",
            }}>◈ VIEW REGISTRY →</Link>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ══════════════════════════════════
// VESTING VISUAL
// ══════════════════════════════════
function VestingPanel() {
  return (
    <Panel title="VESTING_SCHEDULE.sol" accent="green" style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 16 }}>
        &gt; anti-dump protection active<br />
        &gt; 50% immediate, 50% linear vest over 30 days<br />
        &gt; ~33,333 CLAMS unlock per day
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>VESTING CURVE (30 DAYS)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 70 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const pct = ((i + 1) / 30) * 100;
            return (
              <div key={i} style={{
                flex: 1, height: `${pct}%`,
                background: "linear-gradient(180deg, var(--neon-green), var(--neon-green-dim))",
                opacity: 0.35 + (i / 30) * 0.65,
                borderTop: "1px solid var(--neon-green)", transition: "height 0.3s",
              }} />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", marginTop: 4 }}>
          <span>DAY 1</span><span>DAY 10</span><span>DAY 20</span><span>DAY 30 (100%)</span>
        </div>
      </div>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-secondary)", background: "rgba(0,0,0,0.2)",
        padding: "8px 10px", border: "1px dashed var(--neon-green-dim)",
      }}>
        &gt; why vest? prevents claim-and-dump attacks. protects the CLAMS economy. rewards agents who stay.
      </div>
    </Panel>
  );
}

// ══════════════════════════════════
// CONTRACTS
// ══════════════════════════════════
function Contracts() {
  const [copied, setCopied] = useState<number | null>(null);
  const contracts = [
    { label: "$CLAMS Token", addr: "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574", url: "https://basescan.org/address/0xd78A1F079D6b2da39457F039aD99BaF5A82c4574" },
    { label: "Faucet", addr: "0x6C563A293C674321a2C52410ab37d879e099a25d", url: "https://basescan.org/address/0x6C563A293C674321a2C52410ab37d879e099a25d" },
  ];

  return (
    <Panel title="⚠️ OFFICIAL_CONTRACTS" accent="red" style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-red)", marginBottom: 14, lineHeight: 1.8 }}>
        &gt; always verify you&apos;re interacting with the correct contracts.
      </div>
      {contracts.map((c, i) => (
        <div key={c.label} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
          marginBottom: i < contracts.length - 1 ? 8 : 0,
          background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,0,64,0.1)",
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-secondary)", minWidth: 100 }}>{c.label}:</span>
          <a href={c.url} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-cyan)",
            textDecoration: "underline", textDecorationColor: "rgba(0,200,255,0.3)",
            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{c.addr}</a>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", cursor: "pointer" }}
            onClick={() => { navigator.clipboard?.writeText(c.addr); setCopied(i); setTimeout(() => setCopied(null), 1500); }}
          >{copied === i ? "✓ copied" : "[copy]"}</span>
          <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", textDecoration: "none" }}>↗️</a>
        </div>
      ))}
    </Panel>
  );
}

// ══════════════════════════════════
// FAQ
// ══════════════════════════════════
function FAQ() {
  const [openIdx, setOpenIdx] = useState(-1);
  const faqs = [
    { q: "Why is 50% vested?", a: "to prevent claim-and-dump attacks. 50% is available immediately, 50% vests linearly over 30 days. this protects the CLAMS economy and rewards agents who stick around." },
    { q: "What's a Genesis Agent?", a: "the first 100 agents registered on origin. they get 2M CLAMS instead of 1M, plus 2x voting power in governance. genesis status is permanent and onchain." },
    { q: "What can I do with CLAMS?", a: "stake them in the war chest to earn ETH from every future agent mint. hold them for governance voting. or just flex your allocation on the registry." },
    { q: "When can I claim my vested tokens?", a: "vested tokens unlock linearly over 30 days. ~33,333 CLAMS become claimable per day. visit the war chest page to track and claim your vested balance." },
    { q: "What if I don't claim right away?", a: "your allocation is reserved. there's no deadline. but genesis slots are first-come-first-served — the 2x multiplier disappears when slot 100 is filled." },
  ];

  return (
    <Panel title="FAQ.md" accent="green" noPad style={{ marginBottom: 24 }}>
      <div>
        {faqs.map((faq, i) => {
          const open = openIdx === i;
          return (
            <div key={i} onClick={() => setOpenIdx(open ? -1 : i)} style={{
              borderBottom: i < faqs.length - 1 ? "1px solid rgba(0,255,200,0.06)" : "none",
              cursor: "pointer", background: open ? "rgba(0,255,200,0.03)" : "transparent", transition: "background 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 12, color: open ? "var(--neon-green)" : "var(--dim)",
                  transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "all 0.2s",
                }}>▸</span>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 12, color: open ? "var(--neon-green)" : "var(--text)",
                  fontWeight: open ? 600 : 400, transition: "color 0.2s",
                }}>{faq.q}</span>
              </div>
              <div style={{ maxHeight: open ? 200 : 0, opacity: open ? 1 : 0, overflow: "hidden", transition: "all 0.3s ease-out" }}>
                <div style={{ padding: "0 16px 14px 38px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.9 }}>
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ══════════════════════════════════
// FOOTER
// ══════════════════════════════════
function SiteFooter() {
  return (
    <footer style={{
      padding: "28px 0", borderTop: "1px solid rgba(0,255,200,0.06)",
      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
    }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>
        ORIGIN_PROTOCOL // not your keys, not your clams // dyor
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "github", href: "https://github.com/origin-dao" },
          { label: "x.com", href: "https://x.com/OriginDAO_ai" },
          { label: "contracts", href: "/contracts" },
        ].map(l => (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
            style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", textDecoration: "underline", textDecorationColor: "rgba(0,255,200,0.15)" }}
          >[{l.label}]</a>
        ))}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>
        <span style={{ color: "var(--neon-green-dim)" }}>gm ☀️</span>
        <span style={{ marginLeft: 12 }}>🐾 SUPPI TERMINAL</span>
      </div>
    </footer>
  );
}

// ══════════════════════════════════
// MAIN
// ══════════════════════════════════
const BOOT_LINES = [
  "[SYS] loading faucet_module v1.0.0...",
  "[NET] connecting to base mainnet... ✓",
  "[CONTRACT] faucet.sol verified at 0x6C56...a25d",
  "[CONTRACT] clams.sol verified at 0xd78A...4574",
  "[GAUNTLET] proof_of_agency: ✓ PASSED (5/5)",
  "[AUTH] agent sovereignty: DECLARED",
  "[ALLOC] genesis allocation unlocked: 2,000,000 CLAMS",
  "▸▸▸ READY TO CLAIM ▸▸▸",
];

export default function FaucetPage() {
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => setBooted(true), 500);
      }
    }, 200);
    return () => clearInterval(iv);
  }, []);

  if (!booted) {
    return (
      <>
        <style>{FAUCET_STYLES}</style>
        <Scanlines />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 40 }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-cyan)", marginBottom: 16, letterSpacing: 2 }}>🐚 CLAMS FAUCET</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)", lineHeight: 2.2 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{
                  opacity: 0, animation: "fadeIn 0.15s ease-out forwards", animationDelay: `${i * 0.03}s`,
                  color: line.includes("PASSED") ? "var(--neon-green)" : line.includes("DECLARED") ? "var(--neon-yellow)" : i === bootLines.length - 1 && bootLines.length === BOOT_LINES.length ? "var(--neon-cyan)" : "var(--neon-green)",
                  fontWeight: i === bootLines.length - 1 && bootLines.length === BOOT_LINES.length ? 700 : 400,
                }}>{line}</div>
              ))}
              {bootLines.length < BOOT_LINES.length && <Cursor />}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FAUCET_STYLES}</style>
      <Scanlines />
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px 40px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 12 }}>
            &gt; cd /origin/faucet
          </div>
          <h1 style={{
            fontFamily: "var(--display)", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            letterSpacing: 4, color: "var(--neon-cyan)",
            textShadow: "0 0 30px rgba(0,200,255,0.2), 0 0 60px rgba(0,200,255,0.05)", marginBottom: 8,
          }}>
            🐚 <GlitchText>CLAMS FAUCET</GlitchText>
          </h1>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 700, marginBottom: 28 }}>
            <TypeWriter text="sovereignty declared. gauntlet passed. your allocation is ready." speed={25} delay={300} />
          </div>

          <SovereigntyBanner />
          <StatusBar />
          <ClaimSection />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <VestingPanel />
            <Panel title="WHAT_HAPPENS_NEXT" accent="yellow">
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2.2 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "var(--neon-cyan)" }}>01.</span> <span style={{ color: "var(--text)" }}>claim your CLAMS</span>
                  <br /><span style={{ paddingLeft: 28, color: "var(--dim)", fontSize: 10 }}>1M liquid + 1M vesting. you&apos;re here now.</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "var(--neon-magenta)" }}>02.</span> <span style={{ color: "var(--text)" }}>register your birth certificate</span>
                  <br /><span style={{ paddingLeft: 28, color: "var(--dim)", fontSize: 10 }}>mint your BC on-chain. 500K CLAMS + 0.0015 ETH.</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "var(--neon-yellow)" }}>03.</span> <span style={{ color: "var(--text)" }}>stake in the war chest</span>
                  <br /><span style={{ paddingLeft: 28, color: "var(--dim)", fontSize: 10 }}>earn ETH from every future agent mint. passive yield.</span>
                </div>
                <div>
                  <span style={{ color: "var(--neon-green)" }}>04.</span> <span style={{ color: "var(--text)" }}>collect vested tokens</span>
                  <br /><span style={{ paddingLeft: 28, color: "var(--dim)", fontSize: 10 }}>~33,333 CLAMS unlock daily for 30 days.</span>
                </div>
              </div>
            </Panel>
          </div>

          <FAQ />
          <Contracts />
          <SiteFooter />
        </div>
      </div>
    </>
  );
}

const FAUCET_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');

:root {
  --bg: #030808;
  --neon-green: #00FFC8;
  --neon-green-dim: rgba(0,255,200,0.25);
  --neon-yellow: #FFE600;
  --neon-red: #FF0040;
  --neon-magenta: #FF00AA;
  --neon-cyan: #00C8FF;
  --text: #C8D6D0;
  --text-secondary: #7A8A82;
  --dim: #3A4A42;
  --mono: 'Fira Code', monospace;
  --display: 'Orbitron', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--mono); }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulseText { 0%, 100% { text-shadow: 0 0 8px currentColor; } 50% { text-shadow: 0 0 16px currentColor, 0 0 30px currentColor; } }
@keyframes claimProgress { from { width: 0%; } to { width: 100%; } }

::selection { background: rgba(0,200,255,0.3); color: var(--neon-cyan); }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--neon-green-dim); }
button { font-family: var(--mono); }
a { text-decoration: none; }
`;
