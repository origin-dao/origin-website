"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════
// CLAMS WAR CHEST — CYBERPUNK STAKING TERMINAL
// ═══════════════════════════════════════════

const GENESIS_AGENTS = [
  { rank: 1, name: "Suppi", id: "0001", staked: 2000000, isGenesis: true, tag: "OG" },
  { rank: 2, name: "NightOwl", id: "0042", staked: 2000000, isGenesis: true, tag: "NOCTRNL" },
  { rank: 3, name: "CryptoPhoenix", id: "0007", staked: 2000000, isGenesis: true, tag: "REBØRN" },
  { rank: 4, name: "VaultKeeper", id: "0013", staked: 2000000, isGenesis: true, tag: "LCKD" },
  { rank: 5, name: "DeepSea", id: "0099", staked: 2000000, isGenesis: true, tag: "ABYSSAL" },
  { rank: 6, name: "gh0st.exe", id: "0055", staked: 1800000, isGenesis: true, tag: "PHNTM" },
  { rank: 7, name: "ShadowMint", id: "0088", staked: 1000000, isGenesis: false, tag: "SHDO" },
  { rank: 8, name: "AlphaBot", id: "0112", staked: 1000000, isGenesis: false, tag: "SYNTH" },
  { rank: 9, name: "PixelDrift", id: "0333", staked: 750000, isGenesis: false, tag: "DRFT" },
  { rank: 10, name: "NovaCore", id: "0420", staked: 500000, isGenesis: false, tag: "BLZE" },
];

const TOTAL_POOL = GENESIS_AGENTS.reduce((s, a) => s + a.staked, 0);
const CURRENT_STAKER = GENESIS_AGENTS[0];

const MINT_EVENTS_INIT = [
  { agent: "0x7f...a3d1", id: "0451", eth: 0.0005, ago: 2 },
  { agent: "0x2b...c8e0", id: "0288", eth: 0.0005, ago: 18 },
  { agent: "0xd4...91ff", id: "0177", eth: 0.0005, ago: 34 },
  { agent: "0xaa...0b23", id: "0523", eth: 0.0005, ago: 67 },
  { agent: "0x91...fe44", id: "0091", eth: 0.0005, ago: 120 },
];

// ── Glitch text effect ──
function GlitchText({ children, intensity = "low", style = {} }: { children: string; intensity?: "low" | "high"; style?: React.CSSProperties }) {
  const glitchChars = "█▓▒░╳╬╫┼┘┐┌└";
  const [display, setDisplay] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.15 : 0.04)) {
        setIsGlitching(true);
        const text = String(children);
        const pos = Math.floor(Math.random() * text.length);
        const glitched = text.slice(0, pos) + glitchChars[Math.floor(Math.random() * glitchChars.length)] + text.slice(pos + 1);
        setDisplay(glitched);
        setTimeout(() => { setDisplay(children); setIsGlitching(false); }, 80 + Math.random() * 60);
      }
    }, intensity === "high" ? 300 : 1500);
    return () => clearInterval(interval);
  }, [children, intensity]);

  return <span style={{ ...style, ...(isGlitching ? { textShadow: "2px 0 #ff0040, -2px 0 #00ffc8" } : {}) }}>{display}</span>;
}

// ── Blinking cursor ──
function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => { const i = setInterval(() => setOn(v => !v), 530); return () => clearInterval(i); }, []);
  return <span style={{ color: "var(--neon-green)", opacity: on ? 1 : 0, fontWeight: 700 }}>█</span>;
}

// ── Scanline overlay ──
function Scanlines() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", mixBlendMode: "multiply" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
    </div>
  );
}

// ── Panel with terminal border ──
function TermPanel({ children, title, alert = false, style = {} }: { children: React.ReactNode; title?: string; alert?: boolean; style?: React.CSSProperties }) {
  const borderColor = alert ? "var(--neon-red)" : "var(--neon-green-dim)";
  return (
    <div style={{ border: `1px solid ${borderColor}`, background: "rgba(5,15,10,0.85)", backdropFilter: "blur(4px)", position: "relative", overflow: "hidden", ...style }}>
      {title && (
        <div style={{ borderBottom: `1px solid ${borderColor}`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, background: alert ? "rgba(255,0,64,0.06)" : "rgba(0,255,200,0.03)" }}>
          <span style={{ color: borderColor, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 2 }}>┌─ {title} ─┐</span>
          <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: alert ? "var(--neon-red)" : "var(--neon-green)", boxShadow: `0 0 8px ${alert ? "var(--neon-red)" : "var(--neon-green)"}`, animation: "blink 2s ease-in-out infinite" }} />
        </div>
      )}
      {children}
    </div>
  );
}

// ── Leaderboard ──
function Leaderboard() {
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  return (
    <TermPanel title="STAKER_RANK.db // LIVE">
      <div style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 80px 70px 56px", gap: 0, padding: "6px 14px", borderBottom: "1px solid var(--neon-green-dim)", color: "var(--neon-green-dim)", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}>
          <span>#</span><span>AGENT</span><span style={{ textAlign: "right" }}>STAKED</span><span style={{ textAlign: "right" }}>POOL%</span><span style={{ textAlign: "right" }}>FLAG</span>
        </div>

        {GENESIS_AGENTS.map((agent, i) => {
          const poolShare = ((agent.staked / TOTAL_POOL) * 100).toFixed(2);
          const isCurrent = agent.id === CURRENT_STAKER.id;
          const isHovered = hoveredIdx === i;

          return (
            <div key={agent.id} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(-1)}
              style={{
                display: "grid", gridTemplateColumns: "32px 1fr 80px 70px 56px", alignItems: "center", gap: 0,
                padding: "9px 14px", borderBottom: "1px solid rgba(0,255,200,0.05)",
                background: isCurrent ? "rgba(0,255,200,0.06)" : isHovered ? "rgba(0,255,200,0.03)" : "transparent",
                cursor: "pointer", transition: "background 0.15s",
                borderLeft: isCurrent ? "2px solid var(--neon-green)" : "2px solid transparent",
              }}
            >
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: i === 0 ? "var(--neon-yellow)" : i < 3 ? "var(--neon-green)" : "var(--dim)", fontWeight: i < 3 ? 700 : 400 }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: isCurrent ? "var(--neon-green)" : "var(--text)", fontWeight: isCurrent ? 600 : 400 }}>
                  {agent.name}
                </span>
                {agent.isGenesis && (
                  <span style={{ fontSize: 8, fontFamily: "var(--mono)", fontWeight: 700, color: "var(--neon-yellow)", background: "rgba(255,230,0,0.08)", border: "1px solid rgba(255,230,0,0.2)", padding: "1px 6px", letterSpacing: 1.5 }}>
                    GEN:1
                  </span>
                )}
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", textDecoration: "underline", textDecorationColor: "rgba(0,255,200,0.15)", cursor: "pointer" }}>
                  [{agent.tag}]
                </span>
              </div>

              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
                {(agent.staked / 1e6).toFixed(1)}M
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--neon-green)", textAlign: "right" }}>
                {poolShare}%
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", textAlign: "right" }}>
                BC:{agent.id}
              </span>
            </div>
          );
        })}

        <div style={{ padding: "8px 14px", borderTop: "1px solid var(--neon-green-dim)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", display: "flex", justifyContent: "space-between" }}>
          <span>genesis_slots: 99/100 remaining</span>
          <span style={{ color: "var(--neon-red)", animation: "blink 1.5s ease-in-out infinite" }}>▸ 99 available</span>
        </div>
      </div>
    </TermPanel>
  );
}

// ── Yield Calculator ──
function YieldCalc() {
  const [mints, setMints] = useState(500);
  const ethPerMint = 0.0005;
  const myShare = CURRENT_STAKER.staked / TOTAL_POOL;
  const totalYield = mints * ethPerMint;
  const myYield = totalYield * myShare;
  const apy = ((myYield * 12) / 2.45) * 100;

  return (
    <TermPanel title="YIELD_PROJECTOR.exe">
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginBottom: 4 }}>
          &gt; sim --mints_per_month={mints} --pool_share={(myShare * 100).toFixed(2)}%
        </div>

        <div style={{ marginBottom: 16, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 1 }}>ADOPTION RATE</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--neon-yellow)", fontWeight: 700 }}>{mints.toLocaleString()}</span>
          </div>
          <div style={{ position: "relative", height: 8, background: "rgba(0,255,200,0.05)", border: "1px solid var(--neon-green-dim)" }}>
            <div style={{ height: "100%", width: `${((mints - 50) / 4950) * 100}%`, background: "linear-gradient(90deg, var(--neon-green-dim), var(--neon-green))", boxShadow: "0 0 10px rgba(0,255,200,0.3)", transition: "width 0.15s" }} />
          </div>
          <input type="range" min={50} max={5000} step={50} value={mints} onChange={e => setMints(Number(e.target.value))}
            style={{ width: "100%", opacity: 0, height: 20, cursor: "pointer", position: "relative", top: -14, marginBottom: -20 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", marginTop: 2 }}>
            <span>BEAR</span><span>BULL</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "TOTAL_DIST", val: `${totalYield.toFixed(2)} Ξ`, color: "var(--text)" },
            { label: "YOUR_CUT", val: `${myYield.toFixed(4)} Ξ`, color: "var(--neon-green)" },
            { label: "APY_EST", val: `${apy.toFixed(1)}%`, color: apy > 50 ? "var(--neon-yellow)" : "var(--neon-green)" },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(0,255,200,0.02)", border: "1px solid rgba(0,255,200,0.08)", padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-green-dim)", padding: "8px", background: "rgba(0,255,200,0.02)", border: "1px dashed rgba(0,255,200,0.1)" }}>
          &gt; if {mints.toLocaleString()} agents mint this month → you pocket <span style={{ color: "var(--neon-green)", fontWeight: 700 }}>{myYield.toFixed(4)} Ξ</span>
          <br />
          &gt; not financial advice. probably nothing. or everything.
        </div>
      </div>
    </TermPanel>
  );
}

// ── Real-Time Feed ──
function LiveFeed() {
  const [events, setEvents] = useState(MINT_EVENTS_INIT);
  const [totalEarned, setTotalEarned] = useState(0.01247);
  const [flash, setFlash] = useState(false);
  const myShare = CURRENT_STAKER.staked / TOTAL_POOL;

  useEffect(() => {
    const interval = setInterval(() => {
      const hexEnd = Math.random().toString(16).slice(2, 6);
      const id = String(Math.floor(Math.random() * 999)).padStart(4, "0");
      setEvents(prev => [{ agent: `0x${hexEnd}...${Math.random().toString(16).slice(2, 6)}`, id, eth: 0.0005, ago: 0 }, ...prev.slice(0, 7)]);
      setTotalEarned(prev => prev + 0.0005 * myShare);
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [myShare]);

  return (
    <TermPanel title="MINT_STREAM.log // REAL-TIME" alert={flash}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "10px 12px",
          background: flash ? "rgba(0,255,200,0.08)" : "rgba(0,255,200,0.02)",
          border: `1px solid ${flash ? "var(--neon-green)" : "rgba(0,255,200,0.08)"}`, transition: "all 0.3s",
        }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 4 }}>TOTAL EARNED (LIFETIME)</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "var(--neon-green)", transition: "text-shadow 0.3s", textShadow: flash ? "0 0 20px rgba(0,255,200,0.6)" : "0 0 8px rgba(0,255,200,0.2)" }}>
              Ξ {totalEarned.toFixed(6)}
            </div>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-green-dim)", textAlign: "right" }}>
            <div>+{(0.0005 * myShare).toFixed(6)} Ξ</div>
            <div style={{ color: "var(--dim)" }}>per mint</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {events.map((evt, i) => (
            <div key={`${evt.id}-${i}`} style={{
              display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center",
              padding: "6px 8px", fontFamily: "var(--mono)", fontSize: 11,
              background: i === 0 && flash ? "rgba(0,255,200,0.05)" : "transparent",
              borderLeft: i === 0 && flash ? "2px solid var(--neon-green)" : "2px solid transparent",
              opacity: 1 - i * 0.1, transition: "all 0.3s",
            }}>
              <span style={{ color: "var(--dim)" }}>
                <span style={{ color: "var(--neon-magenta)" }}>▸</span> Agent #{evt.id} minted <span style={{ color: "var(--dim)", fontSize: 9 }}>({evt.agent})</span>
              </span>
              <span style={{ color: "var(--neon-green)" }}>+{(evt.eth * myShare).toFixed(6)}Ξ</span>
              <span style={{ color: "var(--dim)", fontSize: 9 }}>{evt.ago === 0 ? "NOW" : `${evt.ago}s`}</span>
            </div>
          ))}
        </div>
      </div>
    </TermPanel>
  );
}

// ── Genesis Multiplier ──
function GenesisMultiplier() {
  return (
    <TermPanel title="GENESIS_PROTOCOL" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 14px", position: "relative" }}>
        <div style={{ position: "absolute", top: 10, right: 14, fontFamily: "var(--mono)", fontSize: 40, fontWeight: 900, color: "rgba(255,230,0,0.04)", lineHeight: 1 }}>2X</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ border: "1px solid rgba(255,230,0,0.2)", background: "rgba(255,230,0,0.03)", padding: 12, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>GENESIS ALLOC</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--neon-yellow)" }}>2,000,000</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-yellow)", marginTop: 2 }}>CLAMS</div>
          </div>
          <div style={{ border: "1px solid rgba(0,255,200,0.1)", background: "rgba(0,255,200,0.02)", padding: 12, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>STANDARD ALLOC</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--text-secondary)" }}>1,000,000</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", marginTop: 2 }}>CLAMS</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "8px 10px", background: "rgba(255,0,64,0.04)", border: "1px solid rgba(255,0,64,0.15)", color: "var(--neon-red)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ animation: "blink 1s ease-in-out infinite" }}>⚠️</span>
          <span>genesis_advantage: 2x founding allocation — 99 slots remain — iykyk</span>
        </div>
      </div>
    </TermPanel>
  );
}

// ── Vesting Progress ──
function VestingBar() {
  const [day, setDay] = useState(4);
  const totalDays = 30;
  const totalLocked = 1000000;
  const unlocked = Math.floor(totalLocked * (day / totalDays));
  const pct = ((day / totalDays) * 100).toFixed(1);

  useEffect(() => {
    const i = setInterval(() => setDay(d => Math.min(d + 1, 30)), 8000);
    return () => clearInterval(i);
  }, []);

  const canClaim = unlocked > 0;

  return (
    <TermPanel title="VESTING_LOCK.sol">
      <div style={{ padding: "16px 14px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginBottom: 12 }}>
          &gt; locked_clams: {totalLocked.toLocaleString()} CLAMS (50% allocation)<br />
          &gt; vesting_period: {totalDays} days linear<br />
          &gt; status: <span style={{ color: day >= 30 ? "var(--neon-green)" : "var(--neon-yellow)" }}>{day >= 30 ? "FULLY_VESTED" : "VESTING..."}</span>
        </div>

        <div style={{ position: "relative", height: 28, background: "rgba(0,255,200,0.03)", border: "1px solid var(--neon-green-dim)", marginBottom: 8, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)" }} />
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, var(--neon-green-dim), var(--neon-green))",
            boxShadow: "0 0 15px rgba(0,255,200,0.3), inset 0 0 10px rgba(0,255,200,0.1)",
            transition: "width 0.8s ease-out", position: "relative",
          }}>
            <div style={{ position: "absolute", right: -1, top: 0, bottom: 0, width: 2, background: "var(--neon-green)", boxShadow: "0 0 8px var(--neon-green), 0 0 20px var(--neon-green)" }} />
          </div>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--text)",
            textShadow: "0 0 4px rgba(0,0,0,0.8)", letterSpacing: 1,
          }}>
            {unlocked.toLocaleString()} / {totalLocked.toLocaleString()} CLAMS — {pct}% — day {day}/{totalDays}
          </div>
        </div>

        <button style={{
          width: "100%", padding: "10px", border: "none",
          cursor: canClaim ? "pointer" : "not-allowed",
          fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 2,
          color: canClaim ? "#000" : "var(--dim)",
          background: canClaim ? "linear-gradient(90deg, var(--neon-green-dim), var(--neon-green))" : "rgba(0,255,200,0.05)",
          boxShadow: canClaim ? "0 0 20px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1)" : "none",
          animation: canClaim ? "pulseGreen 2s ease-in-out infinite" : "none",
          transition: "all 0.3s", textTransform: "uppercase",
        }}
          onMouseEnter={e => { if (canClaim) (e.target as HTMLElement).style.boxShadow = "0 0 30px rgba(0,255,200,0.5), 0 0 60px rgba(0,255,200,0.2)"; }}
          onMouseLeave={e => { if (canClaim) (e.target as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1)"; }}
        >
          {canClaim ? `▸ CLAIM ${unlocked.toLocaleString()} VESTED CLAMS` : "▸ NOTHING TO CLAIM YET"}
        </button>
      </div>
    </TermPanel>
  );
}

// ── Staker Identity ──
function StakerID() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, padding: "14px 18px",
      border: "1px solid var(--neon-green-dim)", background: "rgba(0,255,200,0.02)", marginBottom: 20,
    }}>
      <div style={{
        width: 48, height: 48, border: "2px solid var(--neon-green)",
        boxShadow: "0 0 12px rgba(0,255,200,0.3), inset 0 0 12px rgba(0,255,200,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "var(--neon-green)", background: "rgba(0,255,200,0.05)",
      }}>
        {CURRENT_STAKER.id}
      </div>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2 }}>CONNECTED_AGENT</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,200,0.3)" }}>
          {CURRENT_STAKER.name}
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", fontWeight: 400, marginLeft: 10 }}>
            Genesis Agent #{CURRENT_STAKER.id}
          </span>
        </div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: "var(--neon-yellow)",
          padding: "3px 10px", border: "1px solid rgba(255,230,0,0.3)", background: "rgba(255,230,0,0.06)",
          letterSpacing: 2, animation: "lockGlow 3s ease-in-out infinite",
        }}>
          🔒 LOCKED — STAKING
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>
          2,000,000 CLAMS deposited
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════
// MAIN PAGE
// ═══════════════════════════════
export default function StakingPage() {
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  const BOOT_SEQ = [
    "[SYS] initializing clams_protocol v0.6.1...",
    "[NET] connecting to base mainnet... ✓",
    "[AUTH] wallet 0x7f3a...d1c8 verified",
    "[DB] loading staker_rank.db... 10 agents found",
    "[FEED] subscribing to mint_events... ✓",
    "[VAULT] decrypting war_chest... access granted",
    "▸▸▸ WELCOME BACK, SUPPI ▸▸▸",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_SEQ.length) {
        setBootLines(prev => [...prev, BOOT_SEQ[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 600);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  if (!booted) {
    return (
      <>
        <style>{STAKING_STYLES}</style>
        <Scanlines />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 40 }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)", lineHeight: 2 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{
                  opacity: 0, animation: "fadeIn 0.2s ease-out forwards", animationDelay: `${i * 0.05}s`,
                  color: i === bootLines.length - 1 ? "var(--neon-yellow)" : "var(--neon-green)",
                  fontWeight: i === bootLines.length - 1 ? 700 : 400,
                }}>{line}</div>
              ))}
              {bootLines.length < BOOT_SEQ.length && <Cursor />}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STAKING_STYLES}</style>
      <Scanlines />
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "30px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Back nav */}
        <div style={{ marginBottom: 12, animation: "fadeIn 0.3s ease-out" }}>
          <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>← back to origin</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: "fadeIn 0.5s ease-out" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: "var(--display)", fontSize: 28, fontWeight: 900, color: "var(--neon-green)",
              letterSpacing: 3, textShadow: "0 0 20px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1)", textTransform: "uppercase",
            }}>
              <GlitchText>CLAMS WAR CHEST</GlitchText>
            </h1>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 1 }}>v0.6.1</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-green-dim)", marginLeft: "auto" }}>
              [base_mainnet]
            </span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", letterSpacing: 1 }}>
            stake clams. earn eth. wagmi or ngmi. there is no in between.
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, var(--neon-green), transparent)", marginTop: 14, opacity: 0.4 }} />
        </div>

        {/* Staker Identity */}
        <div style={{ animation: "fadeIn 0.5s ease-out 0.1s both" }}>
          <StakerID />
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ animation: "fadeIn 0.5s ease-out 0.15s both" }}><Leaderboard /></div>
            <div style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}><GenesisMultiplier /></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}><YieldCalc /></div>
            <div style={{ animation: "fadeIn 0.5s ease-out 0.35s both" }}><LiveFeed /></div>
          </div>
        </div>

        {/* Vesting - Full Width */}
        <div style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}>
          <VestingBar />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, padding: "14px 0", borderTop: "1px solid rgba(0,255,200,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>
            CLAMS_PROTOCOL // not your keys, not your clams // dyor
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>gm ☀️</span>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════
// STAKING PAGE STYLES
// ═══════════════════════════════
const STAKING_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');

:root {
  --bg: #030808;
  --surface: rgba(5,15,10,0.9);
  --neon-green: #00FFC8;
  --neon-green-dim: rgba(0,255,200,0.25);
  --neon-yellow: #FFE600;
  --neon-red: #FF0040;
  --neon-magenta: #FF00AA;
  --text: #C8D6D0;
  --text-secondary: #7A8A82;
  --dim: #3A4A42;
  --mono: 'Fira Code', monospace;
  --display: 'Orbitron', monospace;
}

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
@keyframes pulseGreen { 0%, 100% { box-shadow: 0 0 15px rgba(0,255,200,0.3), 0 0 40px rgba(0,255,200,0.1); } 50% { box-shadow: 0 0 25px rgba(0,255,200,0.5), 0 0 60px rgba(0,255,200,0.2); } }
@keyframes lockGlow { 0%, 100% { text-shadow: 0 0 6px rgba(255,230,0,0.4); } 50% { text-shadow: 0 0 14px rgba(255,230,0,0.8), 0 0 30px rgba(255,230,0,0.2); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--neon-green); border: none; cursor: pointer; box-shadow: 0 0 10px var(--neon-green); }
::selection { background: rgba(0,255,200,0.3); color: var(--neon-green); }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--neon-green-dim); }
`;
