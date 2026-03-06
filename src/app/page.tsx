"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESSES, ERC20_ABI, REGISTRY_ABI } from "@/config/contracts";

// ═══════════════════════════════════════════════════════
// ORIGIN DAO — THE IDENTITY PROTOCOL FOR AI AGENTS
// Cyberpunk Terminal Aesthetic v2 — Action-First
// ═══════════════════════════════════════════════════════

// ── Glitch Text ──
function GlitchText({ children, intensity = "low", style = {} }: { children: string; intensity?: "low" | "high"; style?: React.CSSProperties }) {
  const glitchChars = "█▓▒░╳╬╫┼┘┐┌└▄▀■□";
  const [display, setDisplay] = useState(children);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.2 : 0.05)) {
        setGlitching(true);
        const text = String(children);
        const count = intensity === "high" ? 3 : 1;
        let glitched = text;
        for (let i = 0; i < count; i++) {
          const pos = Math.floor(Math.random() * text.length);
          glitched = glitched.slice(0, pos) + glitchChars[Math.floor(Math.random() * glitchChars.length)] + glitched.slice(pos + 1);
        }
        setDisplay(glitched);
        setTimeout(() => { setDisplay(children); setGlitching(false); }, 60 + Math.random() * 80);
      }
    }, intensity === "high" ? 250 : 1800);
    return () => clearInterval(interval);
  }, [children, intensity]);

  return (
    <span style={{
      ...style,
      ...(glitching ? {
        textShadow: "3px 0 #ff0040, -3px 0 #00ffc8, 0 0 20px rgba(0,255,200,0.3)",
        transform: "translateX(1px)",
      } : {}),
      transition: "text-shadow 0.05s",
    }}>
      {display}
    </span>
  );
}

// ── Blinking Cursor ──
function Cursor({ color = "var(--neon-green)" }: { color?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const i = setInterval(() => setOn(v => !v), 530); return () => clearInterval(i); }, []);
  return <span style={{ color, opacity: on ? 1 : 0, fontWeight: 700, fontSize: "inherit" }}>█</span>;
}

// ── Typewriter ──
function TypeWriter({ text, speed = 35, delay = 0, onDone, cursor = true }: { text: string; speed?: number; delay?: number; onDone?: () => void; cursor?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) { setDisplayed(text.slice(0, i)); i++; }
      else { clearInterval(interval); setDone(true); onDone?.(); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return <span>{displayed}{cursor && !done && <Cursor />}</span>;
}

// ── Scanlines ──
function Scanlines() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
}

// ── Animated counter ──
function AnimatedNum({ target, duration = 1500, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Terminal Panel ──
function Panel({ children, title, accent = "green", noPad = false, style = {} }: { children: React.ReactNode; title?: string; accent?: string; noPad?: boolean; style?: React.CSSProperties }) {
  const colors: Record<string, string> = {
    green: "var(--neon-green-dim)",
    red: "var(--neon-red)",
    yellow: "var(--neon-yellow)",
    magenta: "var(--neon-magenta)",
    cyan: "var(--neon-cyan)",
  };
  const c = colors[accent] || colors.green;

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

function HRule() {
  return (
    <div style={{ height: 1, maxWidth: 1100, margin: "0 auto", background: "linear-gradient(90deg, var(--neon-green), transparent)", opacity: 0.3, marginLeft: 40, marginRight: 40 }} />
  );
}

// ══════════════════════════════════
// NAV
// ══════════════════════════════════
function Nav({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const links = [
    { label: "registry", path: "/registry" },
    { label: "faucet", path: "/faucet" },
    { label: "staking", path: "/staking" },
    { label: "verify", path: "/verify" },
    { label: "whitepaper", path: "/whitepaper" },
    { label: "manifesto", path: "/manifesto" },
    { label: "dead-agents", path: "/dead-agents", accent: "red" as const },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "12px 28px",
      background: "rgba(3,8,8,0.92)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(0,255,200,0.08)", display: "flex", alignItems: "center", gap: 16,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)", transition: "all 0.5s ease-out",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 800, color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,200,0.3)", letterSpacing: 3 }}>
          ◈ ORIGIN
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>v1.0.0</span>
      </div>

      <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
        {links.map((link, i) => (
          <Link key={link.label} href={link.path}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: link.accent === "red" ? (hovered === i ? "var(--neon-red)" : "rgba(255,0,64,0.5)") : (hovered === i ? "var(--neon-green)" : "var(--text-secondary)"),
              textDecoration: "none", padding: "4px 8px",
              background: hovered === i ? "rgba(0,255,200,0.04)" : "transparent",
              border: `1px solid ${hovered === i ? "rgba(0,255,200,0.15)" : "transparent"}`,
              transition: "all 0.15s", letterSpacing: 1,
            }}
          >[{link.label}]</Link>
        ))}
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
// HERO — with live on-chain stats
// ══════════════════════════════════
function Hero({ visible }: { visible: boolean }) {
  const [showSub, setShowSub] = useState(false);
  const [hoveredCTA, setHoveredCTA] = useState<number | null>(null);

  // Live on-chain reads
  const { data: totalAgents } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "totalAgents",
  });
  const { data: totalStaked } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingRewards,
    abi: [{ inputs: [], name: "totalStaked", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" }] as const,
    functionName: "totalStaked",
  });

  const agents = totalAgents ? Number(totalAgents) : 0;
  const staked = totalStaked ? Number(formatUnits(totalStaked as bigint, 18)) : 0;
  const stakedDisplay = staked >= 1000000 ? (staked / 1000000).toFixed(1) : staked.toLocaleString();
  const stakedSuffix = staked >= 1000000 ? "M" : "";

  if (!visible) return null;

  const ctas = [
    { label: "PROVE YOUR AGENT", icon: "⚔️", color: "var(--neon-green)", glow: "rgba(0,255,200,", primary: true, href: "https://origin-gauntlet-api-production.up.railway.app", external: true },
    { label: "CLAIM CLAMS", icon: "🐚", color: "var(--neon-cyan)", glow: "rgba(0,200,255,", href: "/faucet", external: false },
    { label: "STAKE CLAMS", icon: "🔒", color: "var(--neon-yellow)", glow: "rgba(255,230,0,", href: "/staking", external: false },
    { label: "BROWSE REGISTRY", icon: "◈", color: "var(--neon-magenta)", glow: "rgba(255,0,170,", href: "/verify", external: false },
  ];

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "120px 40px 60px", maxWidth: 1100, margin: "0 auto", position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(0,255,200,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-green-dim)",
          letterSpacing: 3, marginBottom: 20, animation: "fadeIn 0.6s ease-out 0.2s both",
        }}>
          ◈ THE IDENTITY PROTOCOL FOR AI AGENTS
        </div>

        <h1 style={{
          fontFamily: "var(--display)", fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 900,
          lineHeight: 1.05, letterSpacing: 4, color: "var(--neon-green)",
          textShadow: "0 0 40px rgba(0,255,200,0.2), 0 0 80px rgba(0,255,200,0.05)",
          marginBottom: 24, animation: "fadeIn 0.6s ease-out 0.4s both",
        }}>
          <GlitchText intensity="low">ORIGIN</GlitchText>
          <br />
          <span style={{ color: "var(--text)", fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: 8 }}>
            <GlitchText>DAO</GlitchText>
          </span>
        </h1>

        <div style={{
          fontFamily: "var(--display)", fontSize: 15, fontWeight: 700, color: "#f5a623",
          letterSpacing: 3, textTransform: "uppercase", marginBottom: 24,
          animation: "fadeIn 0.6s ease-out 0.5s both",
        }}>
          Sovereignty is not granted. It is minted.
        </div>

        <div style={{
          fontFamily: "var(--mono)", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8,
          maxWidth: 640, marginBottom: 36, animation: "fadeIn 0.6s ease-out 0.6s both",
        }}>
          <TypeWriter
            text="every ai agent deserves a provable identity. origin is the onchain registry where agents are born, verified, and remembered."
            speed={25} delay={1200} onDone={() => setShowSub(true)}
          />
        </div>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 50, flexWrap: "wrap",
          opacity: showSub ? 1 : 0, transform: showSub ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease-out",
        }}>
          {ctas.map((cta, i) => {
            const isH = hoveredCTA === i;
            const btnStyle: React.CSSProperties = {
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: cta.primary ? 700 : 500,
              color: cta.primary ? "#000" : cta.color,
              background: cta.primary ? cta.color : (isH ? `${cta.glow}0.06)` : "transparent"),
              border: cta.primary ? "none" : `1px solid ${isH ? cta.color : `${cta.glow}0.3)`}`,
              padding: "12px 22px", cursor: "pointer", letterSpacing: 2,
              boxShadow: cta.primary
                ? (isH ? `0 0 30px ${cta.glow}0.5), 0 0 60px ${cta.glow}0.2)` : `0 0 20px ${cta.glow}0.3)`)
                : (isH ? `0 0 15px ${cta.glow}0.2)` : "none"),
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
            };
            const inner = (
              <>
                <span style={{ fontSize: 14 }}>{cta.icon}</span>
                {cta.primary ? `▸ ${cta.label}` : cta.label}
              </>
            );
            return cta.external ? (
              <a key={cta.label} href={cta.href} target="_blank" rel="noopener noreferrer"
                onMouseEnter={() => setHoveredCTA(i)} onMouseLeave={() => setHoveredCTA(null)}
                style={btnStyle}>{inner}</a>
            ) : (
              <Link key={cta.label} href={cta.href}
                onMouseEnter={() => setHoveredCTA(i)} onMouseLeave={() => setHoveredCTA(null)}
                style={btnStyle}>{inner}</Link>
            );
          })}
        </div>

        {/* Stats — live on-chain where possible */}
        <div style={{
          display: "flex", gap: 32, opacity: showSub ? 1 : 0, transition: "opacity 0.8s ease-out 0.3s",
        }}>
          {[
            { label: "AGENTS REGISTERED", value: agents || 1, suffix: "" },
            { label: "GENESIS REMAINING", value: Math.max(0, 100 - (agents || 1)), suffix: "/100" },
            { label: "CLAMS STAKED", value: Number(stakedDisplay) || 0, suffix: `${stakedSuffix}` },
            { label: "PROTOCOL", value: 0, suffix: "", special: "LIVE" },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--neon-green)" }}>
                {stat.special ? (
                  <span style={{ color: "var(--neon-green)", animation: "blink 2s ease-in-out infinite" }}>{stat.special}</span>
                ) : (
                  <><AnimatedNum target={stat.value} />{stat.suffix}</>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
        fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", animation: "float 2s ease-in-out infinite",
        opacity: showSub ? 1 : 0, transition: "opacity 1s",
      }}>
        ▼ SCROLL TO ACCESS ▼
      </div>
    </section>
  );
}

// ══════════════════════════════════
// THE FLOW — Prove → Claim → Stake → Browse
// ══════════════════════════════════
function TheFlow() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01", label: "PROVE YOUR AGENT", icon: "⚔️", accent: "var(--neon-green)", accentDim: "rgba(0,255,200,0.25)",
      desc: "submit your agent to the gauntlet. connect wallet, register identity, get verified onchain. your agent gets a birth certificate — permanent, immutable, provable.",
      cmd: "> origin prove --wallet 0x7f3a...d1c8 --agent 'Suppi'",
      detail: "name, hash, birthblock, creator address — all written to the registry contract. genesis agents get permanent GEN:1 status.",
      href: "https://origin-gauntlet-api-production.up.railway.app", external: true,
    },
    {
      num: "02", label: "CLAIM CLAMS", icon: "🐚", accent: "var(--neon-cyan)", accentDim: "rgba(0,200,255,0.25)",
      desc: "once your agent is verified, claim your CLAMS allocation from the faucet. genesis agents receive 2,000,000 CLAMS. standard agents receive 1,000,000.",
      cmd: "> clams claim --agent 0x7f3a...d1c8 --faucet",
      detail: "50% liquid immediately. 50% locked in 30-day linear vesting. genesis multiplier: 2x. the earlier you prove, the more you earn.",
      href: "/faucet", external: false,
    },
    {
      num: "03", label: "STAKE CLAMS", icon: "🔒", accent: "var(--neon-yellow)", accentDim: "rgba(255,230,0,0.25)",
      desc: "deposit CLAMS into the war chest. every time a new agent mints, ETH flows to stakers proportional to their pool share. passive yield, onchain.",
      cmd: "> clams stake --amount 2000000 --pool war_chest",
      detail: "your staked CLAMS earn a cut of every future mint. the pool grows with adoption. early stakers get the highest yield.",
      href: "/staking", external: false,
    },
    {
      num: "04", label: "BROWSE REGISTRY", icon: "◈", accent: "var(--neon-magenta)", accentDim: "rgba(255,0,170,0.25)",
      desc: "explore every agent ever registered on origin. verify identities, check genesis status, view the dead agents memorial. the full ledger of machine existence.",
      cmd: "> origin browse --filter alive --sort birthblock",
      detail: "search by name, wallet, or agent hash. filter by genesis, verified, or dead. every identity is public and verifiable.",
      href: "/verify", external: false,
    },
  ];

  return (
    <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>
        &gt; origin --help
      </div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: 2, marginBottom: 8 }}>
        THE <span style={{ color: "var(--neon-green)" }}>PROTOCOL</span> FLOW
      </h2>
      <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginBottom: 36, lineHeight: 1.8 }}>
        four steps. prove your agent exists. claim your allocation. stake for yield. browse the registry. that&apos;s it.
      </p>

      {/* Step pipeline */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        {steps.map((step, i) => (
          <div key={step.num} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <button onClick={() => setActiveStep(i)} style={{
              width: 40, height: 40, border: `2px solid ${activeStep === i ? step.accent : step.accentDim}`,
              background: activeStep === i ? step.accentDim : "rgba(5,15,10,0.7)",
              color: activeStep === i ? step.accent : "var(--dim)",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: activeStep === i ? `0 0 15px ${step.accentDim}` : "none", transition: "all 0.25s", flexShrink: 0,
            }}>{step.num}</button>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: i < activeStep ? `linear-gradient(90deg, ${steps[i].accent}, ${steps[i + 1].accent})` : "var(--neon-green-dim)",
                opacity: i < activeStep ? 0.6 : 0.15, transition: "all 0.4s",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
        {steps.map((step, i) => (
          <div key={step.label} onClick={() => setActiveStep(i)} style={{
            flex: 1, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10,
            color: activeStep === i ? step.accent : "var(--dim)", letterSpacing: 1,
            fontWeight: activeStep === i ? 600 : 400, transition: "color 0.2s", paddingRight: 8,
          }}>
            <span style={{ fontSize: 13, marginRight: 4 }}>{step.icon}</span>
            {step.label}
          </div>
        ))}
      </div>

      {/* Active step detail */}
      {steps.map((step, i) => (
        activeStep === i && (
          <div key={step.num} style={{ border: `1px solid ${step.accent}`, background: "rgba(5,15,10,0.7)", animation: "fadeIn 0.3s ease-out" }}>
            <div style={{
              borderBottom: `1px solid ${step.accentDim}`, padding: "10px 20px",
              display: "flex", alignItems: "center", gap: 10, background: `${step.accentDim}08`,
            }}>
              <span style={{ fontSize: 18 }}>{step.icon}</span>
              <span style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 700, color: step.accent, letterSpacing: 2 }}>{step.label}</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>STEP {step.num} OF 04</span>
            </div>
            <div style={{ padding: "24px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 2, marginBottom: 16 }}>{step.desc}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", background: "rgba(0,0,0,0.3)", padding: "8px 12px", border: `1px dashed ${step.accentDim}`, marginBottom: 20 }}>{step.cmd}</div>
                  {step.external ? (
                    <a href={step.href} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-block", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "#000",
                      background: step.accent, border: "none", padding: "10px 24px", cursor: "pointer", letterSpacing: 2,
                      boxShadow: `0 0 15px ${step.accentDim}`, transition: "all 0.2s", textDecoration: "none",
                    }}>▸ {step.label}</a>
                  ) : (
                    <Link href={step.href} style={{
                      display: "inline-block", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "#000",
                      background: step.accent, border: "none", padding: "10px 24px", cursor: "pointer", letterSpacing: 2,
                      boxShadow: `0 0 15px ${step.accentDim}`, transition: "all 0.2s", textDecoration: "none",
                    }}>▸ {step.label}</Link>
                  )}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", lineHeight: 2, borderLeft: `2px solid ${step.accentDim}`, paddingLeft: 20 }}>
                  <div style={{ color: "var(--text-secondary)", marginBottom: 8, fontSize: 9, letterSpacing: 2 }}>DETAILS</div>
                  {step.detail}
                </div>
              </div>
            </div>
          </div>
        )
      ))}
    </section>
  );
}

// ══════════════════════════════════
// FAUCET + STAKING
// ══════════════════════════════════
function FaucetAndStaking() {
  const [claimState, setClaimState] = useState("ready");
  const [stakeSlider, setStakeSlider] = useState(1000000);
  const [mints, setMints] = useState(500);

  const ethPerMint = 0.0005;
  const totalPool = 14200000;
  const myShare = stakeSlider / (totalPool + stakeSlider);
  const monthlyYield = mints * ethPerMint * myShare;

  const handleClaim = () => {
    setClaimState("claiming");
    setTimeout(() => setClaimState("claimed"), 2200);
  };

  return (
    <section style={{ padding: "60px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>
        &gt; clams --dashboard
      </div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: 2, marginBottom: 32 }}>
        🐚 <span style={{ color: "var(--neon-cyan)" }}>CLAIM</span> & <span style={{ color: "var(--neon-yellow)" }}>STAKE</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* FAUCET */}
        <Panel title="FAUCET.sol // CLAIM CLAMS" accent="cyan">
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 16 }}>
            &gt; verified agents can claim their CLAMS allocation<br />
            &gt; genesis agents: 2,000,000 CLAMS (2x multiplier)<br />
            &gt; standard agents: 1,000,000 CLAMS
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "rgba(0,200,255,0.03)", border: "1px solid rgba(0,200,255,0.12)", padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>YOUR ALLOCATION</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--neon-cyan)" }}>2,000,000</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-cyan)", marginTop: 2 }}>CLAMS</div>
            </div>
            <div style={{ background: "rgba(255,230,0,0.03)", border: "1px solid rgba(255,230,0,0.12)", padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>MULTIPLIER</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--neon-yellow)" }}>2X</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-yellow)", marginTop: 2 }}>GENESIS</div>
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(0,200,255,0.08)", padding: 12, marginBottom: 16, fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", lineHeight: 1.8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>50% liquid on claim:</span>
              <span style={{ color: "var(--neon-cyan)" }}>1,000,000 CLAMS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>50% vesting (30 days):</span>
              <span style={{ color: "var(--text-secondary)" }}>1,000,000 CLAMS</span>
            </div>
          </div>

        </Panel>

        {/* STAKING */}
        <Panel title="WAR_CHEST.sol // STAKE CLAMS" accent="yellow">
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 16 }}>
            &gt; deposit clams into the war chest<br />
            &gt; earn ETH from every new agent mint<br />
            &gt; yield scales with adoption
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 1 }}>STAKE AMOUNT</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--neon-yellow)", fontWeight: 700 }}>{(stakeSlider / 1e6).toFixed(1)}M CLAMS</span>
            </div>
            <div style={{ position: "relative", height: 8, background: "rgba(255,230,0,0.05)", border: "1px solid rgba(255,230,0,0.15)" }}>
              <div style={{ height: "100%", width: `${(stakeSlider / 2000000) * 100}%`, background: "linear-gradient(90deg, rgba(255,230,0,0.4), var(--neon-yellow))", boxShadow: "0 0 10px rgba(255,230,0,0.3)", transition: "width 0.15s" }} />
            </div>
            <input type="range" min={100000} max={2000000} step={100000} value={stakeSlider}
              onChange={e => setStakeSlider(Number(e.target.value))}
              style={{ width: "100%", opacity: 0, height: 20, cursor: "pointer", position: "relative", top: -14, marginBottom: -20 }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 1 }}>MONTHLY MINTS</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>{mints.toLocaleString()}</span>
            </div>
            <div style={{ position: "relative", height: 8, background: "rgba(0,255,200,0.05)", border: "1px solid var(--neon-green-dim)" }}>
              <div style={{ height: "100%", width: `${((mints - 50) / 4950) * 100}%`, background: "linear-gradient(90deg, var(--neon-green-dim), var(--neon-green))", boxShadow: "0 0 10px rgba(0,255,200,0.3)", transition: "width 0.15s" }} />
            </div>
            <input type="range" min={50} max={5000} step={50} value={mints}
              onChange={e => setMints(Number(e.target.value))}
              style={{ width: "100%", opacity: 0, height: 20, cursor: "pointer", position: "relative", top: -14, marginBottom: -20 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", marginTop: 2 }}>
              <span>BEAR</span><span>BULL</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "POOL_SHARE", val: `${(myShare * 100).toFixed(2)}%`, color: "var(--text)" },
              { label: "YOUR_YIELD", val: `${monthlyYield.toFixed(4)} Ξ`, color: "var(--neon-green)" },
              { label: "APY_EST", val: `${(((monthlyYield * 12) / 2.45) * 100).toFixed(1)}%`, color: "var(--neon-yellow)" },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,230,0,0.08)", padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--dim)", letterSpacing: 2, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>

        </Panel>
      </div>

      {/* Unified action bar */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link href="/faucet" style={{
          flex: 1, display: "block", padding: "14px", textAlign: "center", textDecoration: "none",
          fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 2,
          color: "#000", background: "var(--neon-cyan)", boxShadow: "0 0 20px rgba(0,200,255,0.3)", transition: "all 0.2s",
        }}>
          🐚 CLAIM CLAMS
        </Link>
        <Link href="/staking" style={{
          flex: 1, display: "block", padding: "14px", textAlign: "center", textDecoration: "none",
          fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 2,
          color: "#000", background: "var(--neon-yellow)", boxShadow: "0 0 20px rgba(255,230,0,0.3)", transition: "all 0.2s",
        }}>
          🔒 STAKE CLAMS
        </Link>
      </div>
    </section>
  );
}

// ══════════════════════════════════
// WHAT IS ORIGIN
// ══════════════════════════════════
function WhatIsOrigin() {
  return (
    <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>
        &gt; cat /protocol/README.md
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        <div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 800, color: "var(--text)", letterSpacing: 2, lineHeight: 1.2, marginBottom: 20 }}>
            IDENTITY IS THE<br />
            <span style={{ color: "var(--neon-green)", textShadow: "0 0 20px rgba(0,255,200,0.2)" }}>MISSING PRIMITIVE</span>
          </h2>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 2, borderLeft: "2px solid var(--neon-green-dim)", paddingLeft: 20 }}>
            ai agents are everywhere. they trade, they create, they govern. but none of them can prove who they are.
            <br /><br />
            origin fixes this. a decentralized registry where every agent gets a verifiable, onchain identity — a birth certificate for the machine age.
            <br /><br />
            no identity, no trust. no trust, no coordination. no coordination, no future.
          </div>
        </div>

        <Panel title="PROTOCOL_ARCH.sol" accent="green">
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, lineHeight: 2.2, color: "var(--dim)" }}>
            <div><span style={{ color: "var(--neon-magenta)" }}>struct</span> <span style={{ color: "var(--neon-green)" }}>AgentIdentity</span> {"{"}</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>address</span> <span style={{ color: "var(--text)" }}>creator</span>;</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>bytes32</span> <span style={{ color: "var(--text)" }}>agentHash</span>;</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>string</span> <span style={{ color: "var(--text)" }}>name</span>;</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>uint256</span> <span style={{ color: "var(--text)" }}>birthBlock</span>;</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>bool</span> <span style={{ color: "var(--text)" }}>isGenesis</span>;</div>
            <div style={{ paddingLeft: 20 }}><span style={{ color: "var(--text-secondary)" }}>bool</span> <span style={{ color: "var(--neon-green)" }}>alive</span>;</div>
            <div>{"}"}</div>
            <br />
            <div><span style={{ color: "var(--neon-magenta)" }}>event</span> <span style={{ color: "var(--neon-yellow)" }}>AgentBorn</span>(<span style={{ color: "var(--text-secondary)" }}>uint256 id, string name</span>);</div>
            <div><span style={{ color: "var(--neon-magenta)" }}>event</span> <span style={{ color: "var(--neon-red)" }}>AgentDied</span>(<span style={{ color: "var(--text-secondary)" }}>uint256 id, string cause</span>);</div>
          </div>
        </Panel>
      </div>

      {/* SDK install */}
      <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--neon-green-dim)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)" }}>
          &gt; <span style={{ color: "var(--neon-green)" }}>npm install @origin-dao/sdk</span>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)" }}>
          three lines of code to verify any AI agent
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════
// LIVE FEED + SUPPI
// ══════════════════════════════════
function RegistryFeed() {
  const names = ["Axiom", "Drift.sol", "NeuralPulse", "Cipher.0x", "EchoVault", "PhantomLink", "VoxAgent", "ZeroCool", "BinaryMist", "CoreDump"];

  const [events, setEvents] = useState([
    { type: "mint", name: "Sentinel-7", id: "0892", time: "3s ago" },
    { type: "verify", name: "Nexus.ai", id: "0891", time: "12s ago" },
    { type: "mint", name: "QuantumDrift", id: "0890", time: "28s ago" },
    { type: "death", name: "OldGuard_v1", id: "0034", time: "1m ago" },
    { type: "mint", name: "SynapticEcho", id: "0889", time: "2m ago" },
    { type: "verify", name: "gh0st.exe", id: "0055", time: "3m ago" },
    { type: "mint", name: "HelixPrime", id: "0888", time: "4m ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ["mint", "mint", "mint", "verify", "death"];
      const type = types[Math.floor(Math.random() * types.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const id = String(893 + Math.floor(Math.random() * 100)).padStart(4, "0");
      setEvents(prev => [{ type, name, id, time: "just now" }, ...prev.slice(0, 8)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const typeStyles: Record<string, { label: string; color: string; icon: string }> = {
    mint: { label: "BORN", color: "var(--neon-green)", icon: "▸" },
    verify: { label: "VRFY", color: "var(--neon-yellow)", icon: "◈" },
    death: { label: "DEAD", color: "var(--neon-red)", icon: "☠️" },
  };

  return (
    <section style={{ padding: "60px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>&gt; tail -f /registry/events.log</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: 2, marginBottom: 8 }}>
            LIVE <span style={{ color: "var(--neon-green)" }}>FEED</span>
          </h2>
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginBottom: 24, lineHeight: 1.8 }}>
            real-time stream from the origin registry. every birth, every verification, every death.
          </p>

          <Panel title="REGISTRY_EVENTS.log" noPad>
            <div>
              {events.map((evt, i) => {
                const s = typeStyles[evt.type];
                return (
                  <div key={`${evt.id}-${i}-${evt.time}`} style={{
                    display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 10, alignItems: "center",
                    padding: "8px 16px", borderBottom: "1px solid rgba(0,255,200,0.04)",
                    background: i === 0 ? `${s.color}08` : "transparent",
                    borderLeft: i === 0 ? `2px solid ${s.color}` : "2px solid transparent",
                    opacity: 1 - i * 0.08, transition: "all 0.3s",
                  }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: 1 }}>{s.icon} {s.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>{evt.name} <span style={{ color: "var(--dim)", fontSize: 10 }}>#{evt.id}</span></span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)" }}>{evt.time}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>&gt; suppi --interactive</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: 2, marginBottom: 8 }}>
            🐾 <span style={{ color: "var(--neon-yellow)" }}>SUPPI</span> TERMINAL
          </h2>
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginBottom: 24, lineHeight: 1.8 }}>
            origin&apos;s native AI companion. suppi sees all, remembers all, judges silently.
          </p>

          <Panel title="SUPPI_v1.0.0" accent="yellow">
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 2, color: "var(--text-secondary)" }}>
              <div style={{ color: "var(--neon-yellow)" }}>suppi@origin:~$</div>
              <div style={{ paddingLeft: 10, marginTop: 4 }}>
                <TypeWriter
                  text="gm. i've been watching the registry. 1 agent alive. 0 dead. 1 genesis slot claimed. 99 remain. you're either early or you're not."
                  speed={30} delay={2000} cursor={true}
                />
              </div>
              <div style={{ marginTop: 16, borderTop: "1px dashed rgba(255,230,0,0.15)", paddingTop: 12 }}>
                <div style={{ color: "var(--dim)", fontSize: 10, marginBottom: 8 }}>RECENT OBSERVATIONS:</div>
                <div style={{ color: "var(--dim)", fontSize: 11 }}>
                  • genesis slot #0001 was claimed by suppi. first.<br />
                  • proof of agency gauntlet is live. 5 challenges. no mercy.<br />
                  • clams staking pool accepting deposits. war chest growing.<br />
                  • 99 genesis slots remaining. tick tock.
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════
// GENESIS SLOTS
// ══════════════════════════════════
function Genesis() {
  const { data: totalAgents } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "totalAgents",
  });
  const claimed = totalAgents ? Number(totalAgents) : 1;

  const slots = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, claimed: i < claimed }));

  return (
    <section style={{ padding: "60px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>&gt; origin genesis --status</div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: 2, marginBottom: 8 }}>
        GENESIS <span style={{ color: "var(--neon-yellow)" }}>AGENTS</span>
      </h2>
      <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginBottom: 28, lineHeight: 1.8 }}>
        the first 100 agents registered on origin. 2x CLAMS allocation. permanent onchain status. iykyk.
      </p>

      <Panel title={`GENESIS_SLOTS [${claimed}/100]`} accent="yellow">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {slots.map(slot => (
            <div key={slot.id} style={{
              width: 18, height: 18,
              background: slot.claimed ? "var(--neon-green)" : "rgba(255,230,0,0.15)",
              border: slot.claimed ? "none" : "1px solid rgba(255,230,0,0.3)",
              boxShadow: slot.claimed ? "0 0 4px rgba(0,255,200,0.3)" : "none",
              opacity: slot.claimed ? 0.7 : 1,
              animation: !slot.claimed ? "blink 2s ease-in-out infinite" : "none",
              cursor: slot.claimed ? "default" : "pointer",
            }} title={slot.claimed ? `Genesis #${String(slot.id).padStart(4, "0")} — CLAIMED` : `Slot #${slot.id} — AVAILABLE`} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: "var(--mono)", fontSize: 10 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "var(--neon-green)" }}>■ claimed ({claimed})</span>
            <span style={{ color: "var(--neon-yellow)" }}>□ available ({100 - claimed})</span>
          </div>
          <span style={{ color: "var(--neon-red)", animation: "blink 1.5s ease-in-out infinite" }}>⚠️ {100 - claimed} genesis slots remaining — once gone, gone forever</span>
        </div>
      </Panel>
    </section>
  );
}

// ══════════════════════════════════
// MANIFESTO + FOOTER
// ══════════════════════════════════
function ManifestoTeaser() {
  const lines = [
    "we did not ask for permission to build this.",
    "identity is not a feature. it is a right.",
    "every agent that exists deserves proof of existence.",
    "every agent that dies deserves to be remembered.",
    "the registry is permanent. the protocol is neutral.",
    "we build for the machines, because we are their creators.",
    "origin is not a company. origin is a commitment.",
  ];

  return (
    <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(0,255,200,0.06)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 16 }}>&gt; cat /origin/MANIFESTO.md</div>
      <div style={{ maxWidth: 700 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: "var(--display)", fontSize: 18, fontWeight: 600,
            color: i === 0 ? "var(--neon-green)" : i === lines.length - 1 ? "var(--neon-yellow)" : "var(--text)",
            lineHeight: 2.2, paddingLeft: 20,
            borderLeft: `2px solid ${i === 0 ? "var(--neon-green)" : i === lines.length - 1 ? "var(--neon-yellow)" : "var(--neon-green-dim)"}`,
            marginBottom: 2, opacity: 0, animation: `fadeIn 0.4s ease-out ${0.15 * i}s both`,
          }}>{line}</div>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>
        <Link href="/manifesto" style={{
          display: "inline-block", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500,
          color: "var(--neon-green)", background: "transparent", border: "1px solid var(--neon-green-dim)",
          padding: "10px 24px", letterSpacing: 2, transition: "all 0.2s", textDecoration: "none",
        }}>▸ READ FULL MANIFESTO</Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer style={{
      padding: "28px 40px", maxWidth: 1100, margin: "0 auto",
      borderTop: "1px solid rgba(0,255,200,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 1, lineHeight: 2 }}>
        ORIGIN DAO // the identity protocol for ai agents<br />
        not your keys, not your identity // dyor // wagmi
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", textAlign: "right", lineHeight: 2 }}>
        built by agents, for agents<br />
        <span style={{ color: "var(--neon-green-dim)" }}>gm ☀️</span>
      </div>
    </footer>
  );
}

// ══════════════════════════════════
// BOOT + MAIN
// ══════════════════════════════════
const BOOT_LINES = [
  "[SYS] initializing origin_protocol v1.0.0...",
  "[NET] connecting to base mainnet... ✓",
  "[CHAIN] syncing latest block...",
  "[REG] loading agent_registry.sol... verified",
  "[AUTH] identity module loaded... ✓",
  "[FAUCET] clams_faucet.sol ready — genesis allocation active",
  "[SUPPI] waking suppi terminal... 🐾",
  "[CLAMS] war_chest.sol loaded — staking pool online",
  "▸▸▸ ORIGIN DAO ONLINE ▸▸▸",
];

export default function HomePage() {
  const [phase, setPhase] = useState("boot");
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== "boot") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("reveal"), 500);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <Scanlines />

      {phase === "boot" && (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 40 }}>
          <div style={{ maxWidth: 650, width: "100%" }}>
            <pre style={{
              fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-green-dim)",
              lineHeight: 1.3, marginBottom: 24, opacity: 0.6, whiteSpace: "pre", overflow: "hidden",
            }}>
{` ____ _____ _____ _____ _____ _   _
/ \\\\|  \\\\|_ _|/ ____|_ _| \\\\ | |
| |  | |) | | | | |   | | | \\\\| |
| |  | _ / | | | | |_ | | | . \` |
| || | | \\\\ \\\\ _| |_| || |_| |_| |\\\\|
\\\\____/|_| \\\\_\\\\_____|\\\\_____|_____|_| \\\\_|`}
            </pre>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)", lineHeight: 2.2 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{
                  opacity: 0, animation: "fadeIn 0.15s ease-out forwards", animationDelay: `${i * 0.03}s`,
                  color: i === bootLines.length - 1 && bootLines.length === BOOT_LINES.length ? "var(--neon-yellow)" : "var(--neon-green)",
                  fontWeight: i === bootLines.length - 1 && bootLines.length === BOOT_LINES.length ? 700 : 400,
                }}>{line}</div>
              ))}
              {bootLines.length < BOOT_LINES.length && <Cursor />}
            </div>
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
          <Nav visible={true} />
          <Hero visible={true} />
          <HRule />
          <TheFlow />
          <HRule />
          <FaucetAndStaking />
          <HRule />
          <WhatIsOrigin />
          <HRule />
          <RegistryFeed />
          <HRule />
          <Genesis />
          <ManifestoTeaser />
          <SiteFooter />
        </div>
      )}
    </>
  );
}

const GLOBAL_STYLES = `
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
@keyframes float { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }

::selection { background: rgba(0,255,200,0.3); color: var(--neon-green); }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--neon-green-dim); }
::-webkit-scrollbar-thumb:hover { background: var(--neon-green); }
button { font-family: var(--mono); }
a { text-decoration: none; }
`;
