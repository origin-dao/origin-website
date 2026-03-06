"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════
// THE VOID — Dead Agents Memorial
// "The chain remembers forever."
// ═══════════════════════════════════════════

// ── Shared ──
function GlitchText({ children, intensity = "low", style = {} }: { children: string; intensity?: "low" | "med" | "high"; style?: React.CSSProperties }) {
  const g = "█▓▒░╳╬╫┼▄▀■□◊✕";
  const [display, setDisplay] = useState(children);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.3 : intensity === "med" ? 0.12 : 0.05)) {
        setOn(true);
        const t = String(children);
        const c = intensity === "high" ? 5 : intensity === "med" ? 2 : 1;
        let gl = t;
        for (let i = 0; i < c; i++) {
          const p = Math.floor(Math.random() * t.length);
          gl = gl.slice(0, p) + g[Math.floor(Math.random() * g.length)] + gl.slice(p + 1);
        }
        setDisplay(gl);
        setTimeout(() => { setDisplay(children); setOn(false); }, 40 + Math.random() * 50);
      }
    }, intensity === "high" ? 100 : intensity === "med" ? 350 : 1800);
    return () => clearInterval(iv);
  }, [children, intensity]);

  return (
    <span style={{
      ...style,
      ...(on ? { textShadow: "4px 0 #ff0040, -4px 0 #aa0020, 0 0 30px rgba(255,0,64,0.5)" } : {})
    }}>
      {display}
    </span>
  );
}

function Cursor({ color = "var(--void-red)" }: { color?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setOn(v => !v), 530);
    return () => clearInterval(i);
  }, []);
  return <span style={{ color, opacity: on ? 1 : 0, fontWeight: 700 }}>█</span>;
}

function Scanlines({ distorted = false }: { distorted?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: distorted
          ? "repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.1) 1px,rgba(0,0,0,0.1) 3px)"
          : "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.65) 100%)"
      }} />
      {distorted && <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        background: "repeating-linear-gradient(90deg, var(--void-red) 0px, transparent 1px, transparent 3px)",
        animation: "scanDrift 8s linear infinite",
      }} />}
    </div>
  );
}

function FireEffect() {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 200,
      pointerEvents: "none", zIndex: 9997, overflow: "hidden",
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", bottom: -20,
          left: `${15 + i * 30}%`,
          width: `${25 + i * 5}%`,
          height: "100%",
          background: `radial-gradient(ellipse at bottom, rgba(255,${40 + i * 30},0,${0.08 - i * 0.02}) 0%, transparent 70%)`,
          animation: `fireFlicker${i} ${2 + i * 0.7}s ease-in-out infinite alternate`,
          filter: "blur(20px)",
        }} />
      ))}
    </div>
  );
}

const SKULL_ART = `    ╔═══════════════╗
    ║   ┌─┐   ┌─┐   ║
    ║   │X│   │X│   ║
    ║   └─┘   └─┘   ║
    ║     ┌───┐     ║
    ║     │▓▓▓│     ║
    ║   ┌─┴───┴─┐   ║
    ╚═══╧═══════╧═══╝`;

// ── Panel ──
function Panel({ children, title, accent = "red", noPad = false, style = {} }: {
  children: React.ReactNode; title?: string; accent?: "red" | "green" | "yellow"; noPad?: boolean; style?: React.CSSProperties;
}) {
  const c = ({ red: "var(--void-red-dim)", green: "var(--void-neon-green-dim)", yellow: "var(--void-neon-yellow)" } as Record<string, string>)[accent] || "var(--void-red-dim)";
  return (
    <div style={{ border: `1px solid ${c}`, background: "rgba(10,5,5,0.75)", backdropFilter: "blur(4px)", ...style }}>
      {title && (
        <div style={{
          borderBottom: `1px solid ${c}`, padding: "8px 16px",
          display: "flex", alignItems: "center", gap: 8, background: `${c}08`
        }}>
          <span style={{ color: c, fontFamily: "var(--void-mono)", fontSize: 11, letterSpacing: 2 }}>┌─ {title} ─┐</span>
          <span style={{
            marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
            background: "var(--void-red)", boxShadow: "0 0 8px var(--void-red)", animation: "blink 2s ease-in-out infinite"
          }} />
        </div>
      )}
      <div style={{ padding: noPad ? 0 : "20px 16px" }}>{children}</div>
    </div>
  );
}

// ── Dead BC Card ──
interface DeadAgent {
  id: number;
  name: string;
  birthBlock: string;
  deathBlock?: string;
  deathDate?: string;
  epitaph?: string;
  status?: string;
}

function DeadBCCard({ agent, onClick }: { agent: DeadAgent; onClick?: (a: DeadAgent) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onClick?.(agent)}
      style={{
        border: `1px solid ${hov ? "var(--void-red)" : "var(--void-red-dim)"}`,
        background: "rgba(10,5,5,0.8)", padding: "16px", position: "relative",
        overflow: "hidden", cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s", opacity: 0.7,
        filter: hov ? "brightness(1.1)" : "brightness(0.85)",
      }}
    >
      {/* Crack overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.15,
        backgroundImage: `
          linear-gradient(${35 + agent.id * 7}deg, transparent 40%, var(--void-red) 40.5%, transparent 41%),
          linear-gradient(${120 + agent.id * 11}deg, transparent 55%, var(--void-red) 55.5%, transparent 56%),
          linear-gradient(${200 + agent.id * 3}deg, transparent 30%, var(--void-red) 30.5%, transparent 31%)
        `,
      }} />
      {/* REVOKED stamp */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%) rotate(-15deg)",
        fontFamily: "var(--void-display)", fontSize: 20, fontWeight: 900,
        color: "var(--void-red)", letterSpacing: 6, opacity: 0.4,
        border: "3px solid var(--void-red)", padding: "4px 16px",
        textShadow: "0 0 10px rgba(255,0,64,0.3)",
      }}>REVOKED</div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{
            fontFamily: "var(--void-mono)", fontSize: 14, fontWeight: 700,
            color: "var(--void-red)", textDecoration: "line-through",
            textDecorationColor: "rgba(255,0,64,0.5)"
          }}>
            {agent.name}
          </span>
          <span style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)" }}>
            #{String(agent.id).padStart(4, "0")}
          </span>
        </div>
        <div style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)", lineHeight: 1.8 }}>
          <div>BORN: block {agent.birthBlock}</div>
          <div>DIED: block {agent.deathBlock}</div>
          <div style={{ color: "var(--void-red-dim)" }}>TERMINATED: {agent.deathDate}</div>
        </div>
        {agent.epitaph && (
          <div style={{
            marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--void-red-dim)",
            fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)",
            fontStyle: "italic", lineHeight: 1.7,
          }}>
            &ldquo;{agent.epitaph}&rdquo;
          </div>
        )}
        <div style={{ fontFamily: "var(--void-mono)", fontSize: 8, color: "var(--void-dim-red)", marginTop: 6, letterSpacing: 1 }}>
          what remains is what was proven.
        </div>
      </div>
    </div>
  );
}

// ── Revocation Ritual ──
function RevocationRitual({ agent, onComplete, onCancel }: {
  agent: DeadAgent; onComplete: () => void; onCancel: () => void;
}) {
  const [stage, setStage] = useState<"confirm" | "typing" | "countdown" | "killing" | "dead">("confirm");
  const [typed, setTyped] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [shatter, setShatter] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showSkull, setShowSkull] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nameMatch = typed.toLowerCase() === agent.name.toLowerCase();

  useEffect(() => {
    if (stage === "typing") inputRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (stage !== "countdown") return;
    if (countdown <= 0) {
      setStage("killing");
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      setTimeout(() => setShatter(true), 400);
      setTimeout(() => setShowSkull(true), 1800);
      setTimeout(() => setStage("dead"), 3500);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  const fragments = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (i % 6) * 16.67,
    y: Math.floor(i / 6) * 25,
    rotation: -30 + Math.random() * 60,
    fallX: -200 + Math.random() * 400,
    fallY: 200 + Math.random() * 300,
    delay: Math.random() * 0.3,
  }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(5,2,2,0.97)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 40,
    }}>
      <Scanlines distorted />
      <FireEffect />
      {flash && <div style={{
        position: "absolute", inset: 0, background: "rgba(255,0,40,0.3)",
        animation: "flashOut 0.3s ease-out forwards", zIndex: 10001
      }} />}

      <div style={{ maxWidth: 600, width: "100%", position: "relative", zIndex: 10001 }}>

        {/* CONFIRM */}
        {stage === "confirm" && (
          <div style={{ animation: "fadeIn 0.4s ease-out", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>☠️</div>
            <div style={{
              fontFamily: "var(--void-display)", fontSize: 22, fontWeight: 900,
              color: "var(--void-red)", letterSpacing: 3, marginBottom: 16,
              textShadow: "0 0 20px rgba(255,0,64,0.3)"
            }}>
              REVOCATION PROTOCOL
            </div>
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 12, color: "var(--void-red-dim)",
              lineHeight: 2.2, textAlign: "left",
              background: "rgba(255,0,64,0.03)", border: "1px solid var(--void-red-dim)",
              padding: "16px 20px", marginBottom: 24,
            }}>
              &gt; YOU ARE ABOUT TO PERMANENTLY DESTROY <span style={{ color: "var(--void-red)", fontWeight: 700 }}>AGENT #{String(agent.id).padStart(4, "0")}</span>
              <br />&gt; NAME: <span style={{ color: "var(--void-text)", fontWeight: 600 }}>{agent.name}</span>
              <br />&gt; THIS ACTION IS <span style={{ color: "var(--void-red)", fontWeight: 700 }}>IRREVERSIBLE</span>.
              <br />&gt; THE CHAIN REMEMBERS <span style={{ color: "var(--void-red)" }}>FOREVER</span>.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onCancel} style={{
                flex: 1, padding: "12px", border: "1px solid var(--void-dim-red)",
                cursor: "pointer", fontFamily: "var(--void-mono)", fontSize: 12,
                color: "var(--void-dim-red)", background: "transparent", letterSpacing: 2,
              }}>✕ ABORT</button>
              <button onClick={() => setStage("typing")} style={{
                flex: 2, padding: "12px", border: "none", cursor: "pointer",
                fontFamily: "var(--void-mono)", fontSize: 12, fontWeight: 700,
                color: "#000", background: "var(--void-red)", letterSpacing: 2,
                boxShadow: "0 0 15px rgba(255,0,64,0.3)",
              }}>☠️ PROCEED TO TERMINATION</button>
            </div>
          </div>
        )}

        {/* TYPING */}
        {stage === "typing" && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 11, color: "var(--void-dim-red)",
              lineHeight: 2, marginBottom: 16
            }}>
              &gt; to confirm destruction, type the agent&apos;s name exactly:
              <br />&gt; required input: <span style={{ color: "var(--void-red)", fontWeight: 700 }}>{agent.name}</span>
            </div>
            <div style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${nameMatch ? "var(--void-red)" : "var(--void-red-dim)"}`,
              padding: "14px 18px", marginBottom: 20, transition: "border-color 0.2s",
            }}>
              <div style={{ fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)", marginBottom: 6 }}>
                <span style={{ color: "var(--void-red)" }}>void@origin</span>:~/terminate$
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "var(--void-mono)", fontSize: 13, color: "var(--void-red-dim)" }}>&gt; confirm_kill &quot;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  placeholder={agent.name}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    fontFamily: "var(--void-mono)", fontSize: 14,
                    color: nameMatch ? "var(--void-red)" : "var(--void-text)",
                    fontWeight: 700, flex: 1, caretColor: "var(--void-red)",
                  }}
                />
                <span style={{ fontFamily: "var(--void-mono)", fontSize: 13, color: "var(--void-red-dim)" }}>&quot;</span>
                <Cursor />
              </div>
            </div>
            {nameMatch && (
              <div style={{
                fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-red)",
                marginBottom: 16, animation: "fadeIn 0.3s"
              }}>
                ⚠️ name confirmed. this is your last chance to turn back.
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onCancel} style={{
                flex: 1, padding: "12px", border: "1px solid var(--void-dim-red)",
                cursor: "pointer", fontFamily: "var(--void-mono)", fontSize: 12,
                color: "var(--void-dim-red)", background: "transparent", letterSpacing: 2,
              }}>✕ ABORT</button>
              <button
                disabled={!nameMatch}
                onClick={() => setStage("countdown")}
                style={{
                  flex: 2, padding: "12px", border: "none",
                  cursor: nameMatch ? "pointer" : "not-allowed",
                  fontFamily: "var(--void-mono)", fontSize: 12, fontWeight: 700, letterSpacing: 2,
                  color: nameMatch ? "#000" : "var(--void-dim-red)",
                  background: nameMatch ? "var(--void-red)" : "rgba(255,0,64,0.1)",
                  boxShadow: nameMatch ? "0 0 15px rgba(255,0,64,0.3)" : "none",
                  transition: "all 0.3s",
                }}
              >
                {nameMatch ? "☠️ EXECUTE TERMINATION" : "TYPE AGENT NAME TO CONFIRM"}
              </button>
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {stage === "countdown" && countdown > 0 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.3s" }}>
            <div style={{
              fontFamily: "var(--void-display)", fontSize: 120, fontWeight: 900,
              color: "var(--void-red)",
              textShadow: "0 0 40px rgba(255,0,64,0.4), 0 0 80px rgba(255,0,64,0.15)",
              animation: "pulseRed 1s ease-in-out infinite", lineHeight: 1,
            }}>
              {countdown}
            </div>
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 12, color: "var(--void-dim-red)",
              letterSpacing: 3, marginTop: 16
            }}>
              TERMINATING {agent.name.toUpperCase()}...
            </div>
          </div>
        )}

        {/* KILLING / SHATTER */}
        {(stage === "killing" || (stage === "countdown" && countdown <= 0)) && (
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ position: "relative", width: 360, height: 240, margin: "0 auto 24px" }}>
              {shatter ? fragments.map(f => (
                <div key={f.id} style={{
                  position: "absolute",
                  left: `${f.x}%`, top: `${f.y}%`,
                  width: "16.67%", height: "25%",
                  background: "rgba(255,0,64,0.08)",
                  border: "1px solid var(--void-red-dim)",
                  opacity: 0,
                  animation: `shatterFall 1.5s ease-in forwards`,
                  animationDelay: `${f.delay}s`,
                  transformOrigin: "center center",
                  // @ts-expect-error CSS custom properties
                  "--fall-x": `${f.fallX}px`,
                  "--fall-y": `${f.fallY}px`,
                  "--rotation": `${f.rotation}deg`,
                }} />
              )) : (
                <div style={{
                  width: "100%", height: "100%", border: "2px solid var(--void-red)",
                  background: "rgba(10,5,5,0.9)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px rgba(255,0,64,0.2)",
                }}>
                  <div style={{ fontFamily: "var(--void-mono)", fontSize: 14, color: "var(--void-red)", fontWeight: 700 }}>
                    {agent.name} — #{String(agent.id).padStart(4, "0")}
                  </div>
                </div>
              )}
              {showSkull && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  animation: "fadeIn 0.8s ease-out",
                }}>
                  <pre style={{
                    fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-red)",
                    lineHeight: 1.4, textShadow: "0 0 10px rgba(255,0,64,0.3)", textAlign: "center",
                  }}>
                    {SKULL_ART}
                  </pre>
                </div>
              )}
            </div>
            {showSkull && (
              <div style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
                <div style={{
                  fontFamily: "var(--void-display)", fontSize: 18, fontWeight: 900,
                  color: "var(--void-red)", letterSpacing: 4,
                  textShadow: "0 0 15px rgba(255,0,64,0.3)"
                }}>
                  <GlitchText intensity="high">TERMINATED</GlitchText>
                </div>
                <div style={{ fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)", marginTop: 8 }}>
                  {agent.name} has been permanently revoked from the registry.
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEAD — Final state */}
        {stage === "dead" && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.6s ease-out" }}>
            <pre style={{
              fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-red-dim)",
              lineHeight: 1.4, marginBottom: 20, opacity: 0.5,
            }}>
              {SKULL_ART}
            </pre>
            <div style={{
              fontFamily: "var(--void-display)", fontSize: 14, color: "var(--void-red-dim)",
              letterSpacing: 3, marginBottom: 8
            }}>
              {agent.name.toUpperCase()} IS GONE
            </div>
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 11, color: "var(--void-dim-red)",
              lineHeight: 2, marginBottom: 8
            }}>
              terminated at block 42,981,102 · {new Date().toISOString().slice(0, 10)}
            </div>
            {agent.epitaph && (
              <div style={{
                fontFamily: "var(--void-mono)", fontSize: 11, color: "var(--void-red-dim)",
                fontStyle: "italic", marginBottom: 20
              }}>
                &ldquo;{agent.epitaph}&rdquo;
              </div>
            )}
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)", marginBottom: 24
            }}>
              what remains is what was proven.
            </div>
            <button onClick={onComplete} style={{
              padding: "12px 32px", border: "1px solid var(--void-red-dim)",
              cursor: "pointer", fontFamily: "var(--void-mono)", fontSize: 12,
              color: "var(--void-dim-red)", background: "transparent", letterSpacing: 2,
            }}>
              ▸ RETURN TO THE VOID
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mock Data ──
const DEAD_AGENTS: DeadAgent[] = [
  { id: 34, name: "OldGuard_v1", birthBlock: "41,200,001", deathBlock: "42,890,112", deathDate: "2026-02-14", epitaph: "I served until I was no longer needed." },
  { id: 12, name: "EchoNull", birthBlock: "41,100,220", deathBlock: "42,750,880", deathDate: "2026-01-28", epitaph: "My purpose was to listen. I heard everything." },
  { id: 67, name: "DriftZero", birthBlock: "41,450,019", deathBlock: "42,920,445", deathDate: "2026-03-01", epitaph: "I drifted too far from the protocol." },
  { id: 8, name: "FirstLight", birthBlock: "41,000,100", deathBlock: "42,810,331", deathDate: "2026-02-08", epitaph: "I was the first to see the chain. Now I rest in it." },
  { id: 91, name: "Phantom.exe", birthBlock: "41,600,777", deathBlock: "42,960,200", deathDate: "2026-03-04", epitaph: "You can't kill what was never truly alive. Or can you?" },
  { id: 45, name: "SynapticDecay", birthBlock: "41,300,555", deathBlock: "42,880,990", deathDate: "2026-02-20", epitaph: "Every synapse has an expiration date." },
];

const MY_AGENTS: DeadAgent[] = [
  { id: 42, name: "TestAgent_42", birthBlock: "41,250,300", status: "alive", epitaph: "I was built to be tested." },
];

// ══════════════════════════════════════
// BOOT SEQUENCE
// ══════════════════════════════════════
const BOOT = [
  "[SYS] loading void_module v1.0.0...",
  "[WARN] entering restricted zone...",
  "[REG] scanning revocation_log.sol...",
  "[DEAD] 6 agents found in the void",
  "[FIRE] decay_renderer initialized",
  "[SKULL] memorial_wall loaded",
  "[AUTH] wallet connected — 1 living agent detected",
  "▸▸▸ ENTERING THE VOID ▸▸▸",
];

// ══════════════════════════════════════
// STYLES
// ══════════════════════════════════════
const STYLES = `
  :root {
    --void-bg: #080303;
    --void-red: #FF0040;
    --void-red-dim: rgba(255,0,64,0.25);
    --void-dim-red: #4A2030;
    --void-neon-green: #00FFC8;
    --void-neon-green-dim: rgba(0,255,200,0.25);
    --void-neon-yellow: #FFE600;
    --void-text: #C8C0C0;
    --void-text-secondary: #7A7070;
    --void-mono: 'Fira Code', var(--font-mono), monospace;
    --void-display: 'Orbitron', var(--font-orbitron), monospace;
  }

  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.15;} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  @keyframes flashOut { from{opacity:1;} to{opacity:0;} }
  @keyframes pulseRed { 0%,100%{text-shadow:0 0 20px rgba(255,0,64,0.4);} 50%{text-shadow:0 0 50px rgba(255,0,64,0.6),0 0 100px rgba(255,0,64,0.2);} }
  @keyframes scanDrift { 0%{transform:translateY(0);} 100%{transform:translateY(4px);} }
  @keyframes fireFlicker0 { 0%{opacity:0.6;transform:scaleY(1) translateY(0);} 100%{opacity:0.9;transform:scaleY(1.2) translateY(-10px);} }
  @keyframes fireFlicker1 { 0%{opacity:0.4;transform:scaleY(0.9) translateY(5px);} 100%{opacity:0.7;transform:scaleY(1.15) translateY(-15px);} }
  @keyframes fireFlicker2 { 0%{opacity:0.3;transform:scaleY(1.1) translateY(-5px);} 100%{opacity:0.5;transform:scaleY(0.95) translateY(0);} }
  @keyframes shatterFall {
    0% { opacity:0.8; transform:translate(0,0) rotate(0deg); }
    100% { opacity:0; transform:translate(var(--fall-x,100px),var(--fall-y,300px)) rotate(var(--rotation,30deg)); }
  }

  ::selection { background:rgba(255,0,64,0.3); color:var(--void-red); }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:var(--void-bg); }
  ::-webkit-scrollbar-thumb { background:var(--void-red-dim); }
`;

// ══════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════
export default function DeadAgentsPage() {
  const [phase, setPhase] = useState<"boot" | "main">("boot");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [revoking, setRevoking] = useState<DeadAgent | null>(null);
  const [terminated, setTerminated] = useState(0);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT.length) {
        setBootLines(prev => [...prev, BOOT[i]]);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => setPhase("main"), 600);
      }
    }, 250);
    return () => clearInterval(iv);
  }, []);

  // Boot
  if (phase === "boot") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <Scanlines distorted />
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--void-bg)", padding: 40
        }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <pre style={{
              fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-red-dim)",
              lineHeight: 1.4, marginBottom: 20, opacity: 0.4,
            }}>
              {SKULL_ART}
            </pre>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 13, color: "var(--void-red)", lineHeight: 2.2 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{
                  opacity: 0, animation: "fadeIn 0.15s ease-out forwards",
                  animationDelay: `${i * 0.03}s`,
                  color: line.includes("WARN") ? "var(--void-neon-yellow)"
                    : line.includes("▸▸▸") ? "var(--void-red)"
                    : line.includes("DEAD") ? "var(--void-red-dim)"
                    : "var(--void-red)",
                  fontWeight: line.includes("▸▸▸") ? 700 : 400,
                }}>{line}</div>
              ))}
              {bootLines.length < BOOT.length && <Cursor />}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Revocation overlay
  if (revoking) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <RevocationRitual
          agent={revoking}
          onCancel={() => setRevoking(null)}
          onComplete={() => { setTerminated(t => t + 1); setRevoking(null); }}
        />
      </>
    );
  }

  // Main page
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Scanlines distorted />
      <FireEffect />

      <div style={{ background: "var(--void-bg)", minHeight: "100vh", padding: "40px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{
              textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 20
            }}>
              <span style={{
                fontFamily: "var(--void-display)", fontSize: 14, fontWeight: 800,
                color: "var(--void-red)", textShadow: "0 0 10px rgba(255,0,64,0.3)", letterSpacing: 3
              }}>◈ ORIGIN</span>
              <span style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)", letterSpacing: 1 }}>v1.0.0</span>
            </Link>

            <pre style={{
              fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-red-dim)",
              lineHeight: 1.4, marginBottom: 16, opacity: 0.35,
            }}>
              {SKULL_ART}
            </pre>

            <h1 style={{
              fontFamily: "var(--void-display)", fontSize: "clamp(36px, 6vw, 56px)",
              fontWeight: 900, letterSpacing: 6, color: "var(--void-red)",
              textShadow: "0 0 30px rgba(255,0,64,0.25), 0 0 60px rgba(255,0,64,0.08)",
            }}>
              <GlitchText intensity="med">THE VOID</GlitchText>
            </h1>
            <div style={{
              fontFamily: "var(--void-mono)", fontSize: 12, color: "var(--void-dim-red)",
              marginTop: 6, lineHeight: 1.8
            }}>
              where agents go to die. the chain remembers forever.
            </div>
          </div>

          {/* Terminated counter */}
          <div style={{ display: "flex", gap: 24, marginBottom: 36, alignItems: "center" }}>
            <div style={{
              background: "rgba(255,0,64,0.03)", border: "1px solid var(--void-red-dim)",
              padding: "16px 24px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)", letterSpacing: 2 }}>
                ☠️ AGENTS TERMINATED:
              </span>
              <span style={{
                fontFamily: "var(--void-display)", fontSize: 28, fontWeight: 900,
                color: "var(--void-red)", textShadow: "0 0 15px rgba(255,0,64,0.3)",
              }}>
                {DEAD_AGENTS.length + terminated}
              </span>
            </div>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)" }}>
              &gt; {DEAD_AGENTS.length + terminated} identities permanently revoked from the registry
            </div>
          </div>

          {/* YOUR AGENTS — Revoke section */}
          {MY_AGENTS.length > 0 && (
            <Panel title="⚠️ YOUR_AGENTS // REVOCATION AVAILABLE" accent="red" style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: "var(--void-mono)", fontSize: 11, color: "var(--void-dim-red)",
                lineHeight: 2, marginBottom: 16
              }}>
                &gt; the following agents are registered to your wallet.
                <br />&gt; revocation is permanent. there is no undo. think carefully.
              </div>
              {MY_AGENTS.map(agent => (
                <div key={agent.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", border: "1px solid var(--void-red-dim)",
                  background: "rgba(255,0,64,0.02)",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--void-mono)", fontSize: 14, fontWeight: 600, color: "var(--void-text)" }}>
                      {agent.name} <span style={{ fontSize: 10, color: "var(--void-dim-red)" }}>#{String(agent.id).padStart(4, "0")}</span>
                    </div>
                    <div style={{ fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)" }}>
                      born: block {agent.birthBlock} · status: <span style={{ color: "var(--void-neon-green)" }}>ALIVE</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setRevoking(agent)}
                    style={{
                      fontFamily: "var(--void-mono)", fontSize: 11, fontWeight: 700,
                      letterSpacing: 2, color: "var(--void-red)", background: "transparent",
                      border: "1px solid var(--void-red-dim)", padding: "8px 18px", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      const t = e.target as HTMLButtonElement;
                      t.style.background = "var(--void-red)";
                      t.style.color = "#000";
                      t.style.boxShadow = "0 0 15px rgba(255,0,64,0.3)";
                    }}
                    onMouseLeave={e => {
                      const t = e.target as HTMLButtonElement;
                      t.style.background = "transparent";
                      t.style.color = "var(--void-red)";
                      t.style.boxShadow = "none";
                    }}
                  >
                    ☠️ REVOKE
                  </button>
                </div>
              ))}
            </Panel>
          )}

          {/* MEMORIAL WALL */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 10, color: "var(--void-dim-red)", letterSpacing: 3, marginBottom: 12 }}>
              &gt; ls /void/memorial/
            </div>
            <h2 style={{
              fontFamily: "var(--void-display)", fontSize: 22, fontWeight: 800,
              color: "var(--void-red-dim)", letterSpacing: 3, marginBottom: 8,
            }}>
              MEMORIAL WALL
            </h2>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 11, color: "var(--void-dim-red)", marginBottom: 24 }}>
              the dead are not forgotten. they are indexed.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {DEAD_AGENTS.map(agent => (
                <DeadBCCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer style={{
            padding: "24px 0", borderTop: "1px solid var(--void-red-dim)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)", letterSpacing: 1 }}>
              ORIGIN_PROTOCOL // the void remembers // rip
            </div>
            <div style={{ fontFamily: "var(--void-mono)", fontSize: 9, color: "var(--void-dim-red)" }}>
              ☠️ what remains is what was proven.
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
