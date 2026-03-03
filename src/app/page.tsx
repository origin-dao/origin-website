"use client";

import { useState, useEffect, useRef } from "react";
import { SuppiChat } from "@/components/SuppiChat";

// ─────────────────────────────────────────────
// SHARED COMPONENTS (same as verify-agent)
// ─────────────────────────────────────────────

const GlitchText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitch && (
        <>
          <span style={{ position: "absolute", top: 0, left: "2px", color: "#ff003c", clipPath: "inset(20% 0 30% 0)", opacity: 0.8 }}>{children}</span>
          <span style={{ position: "absolute", top: 0, left: "-2px", color: "#00f0ff", clipPath: "inset(50% 0 10% 0)", opacity: 0.8 }}>{children}</span>
        </>
      )}
    </span>
  );
};

const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)",
  }} />
);

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "OriginDAO∞Ξ01アイウエオカキクケコ█▓▒░";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 15, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 45);
    const handleResize = () => { if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } };
    window.addEventListener("resize", handleResize);
    return () => { clearInterval(interval); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.4 }} />;
};

const TypeWriter = ({ text, speed = 30, delay = 0 }: { text: string; speed?: number; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);
  useEffect(() => {
    const blink = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);
  if (!started) return null;
  return <span>{displayed}<span style={{ opacity: cursor ? 1 : 0, color: "#00f0ff" }}>█</span></span>;
};

// ─────────────────────────────────────────────
// CONTRACT CONFIG
// ─────────────────────────────────────────────
const CONTRACTS = {
  registry: "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
  proofOfAgency: "0x398d6d1E04E9A7ad7Efc81a229351Ea524e1F68e",
  clamsToken: "0xd78A1F079D6b2da39457F039aD99BaF5A82c4574",
  faucet: "0x6C563A293C674321a2C52410ab37d879e099a25d",
};
const BASE_RPC = "https://mainnet.base.org";

// Minimal ABIs for reads
const REGISTRY_ABI = [
  "function totalAgents() view returns (uint256)",
  "function getAgent(uint256) view returns (tuple(string name, string agentType, string platform, address creator, uint256 parentAgentId, address humanPrincipal, uint256 lineageDepth, uint256 birthTimestamp, bytes32 publicKeyHash, bool active))",
  "function getLicenses(uint256) view returns (tuple(string licenseType, string licenseNumber, string holder, string jurisdiction, bool active)[])",
] as const;
const POA_ABI = [
  "function getGenesisStatus() view returns (bool active, uint256 slotsRemaining)",
  "function hasProof(uint256) view returns (bool)",
] as const;

// ─────────────────────────────────────────────
// LIVE DATA HOOK
// ─────────────────────────────────────────────
interface LiveStats {
  totalAgents: number;
  activeLicenses: number;
  genesisActive: boolean;
  genesisSlots: number;
  agents: { id: number; name: string; type: string; trustLevel: number; birthTimestamp: number; active: boolean; hasProof: boolean }[];
}

function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    totalAgents: 1, activeLicenses: 4, genesisActive: true, genesisSlots: 100,
    agents: [{ id: 1, name: "Suppi", type: "Sun Guardian", trustLevel: 2, birthTimestamp: 1771632000, active: true, hasProof: false }],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Dynamic import ethers to avoid SSR issues
        const { ethers } = await import("ethers");
        const provider = new ethers.JsonRpcProvider(BASE_RPC);
        
        const registry = new ethers.Contract(CONTRACTS.registry, REGISTRY_ABI, provider);
        const poa = new ethers.Contract(CONTRACTS.proofOfAgency, POA_ABI, provider);
        
        const [totalBigInt, genesisResult] = await Promise.all([
          registry.totalAgents(),
          poa.getGenesisStatus(),
        ]);
        
        const total = Number(totalBigInt);
        const [genesisActive, genesisSlotsBigInt] = genesisResult;
        const genesisSlots = Number(genesisSlotsBigInt);
        
        // Fetch all agents (reverse order for newest first)
        const agents = [];
        let totalLicenses = 0;
        for (let id = total; id >= 1; id--) {
          try {
            const [record, licenses, proof] = await Promise.all([
              registry.getAgent(BigInt(id)),
              registry.getLicenses(BigInt(id)).catch(() => []),
              poa.hasProof(BigInt(id)).catch(() => false),
            ]);
            const activeLics = licenses.filter((l: { active: boolean }) => l.active);
            totalLicenses += activeLics.length;
            const hasHuman = record.humanPrincipal !== "0x0000000000000000000000000000000000000000";
            agents.push({
              id,
              name: record.name,
              type: record.agentType,
              trustLevel: activeLics.length > 0 ? 2 : hasHuman ? 1 : 0,
              birthTimestamp: Number(record.birthTimestamp),
              active: record.active,
              hasProof: proof,
            });
          } catch { break; }
        }
        
        setStats({
          totalAgents: total,
          activeLicenses: totalLicenses,
          genesisActive,
          genesisSlots,
          agents,
        });
      } catch (e) {
        console.warn("Failed to fetch live stats:", e);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return stats;
}

// ─────────────────────────────────────────────
// STATIC FALLBACKS
// ─────────────────────────────────────────────

const FEATURES = [
  { icon: "◈", label: "IDENTITY", desc: "On-chain Birth Certificates proving who they are, who made them, and when" },
  { icon: "◈", label: "LICENSES", desc: "Verified professional credentials attached to their certificate" },
  { icon: "◈", label: "TRUST LEVELS", desc: "0 → 1 → 2 progressive trust earned through verification and track record" },
  { icon: "◈", label: "LINEAGE", desc: "Full provenance chain from agent back to accountable human principal" },
  { icon: "◈", label: "GOVERNANCE", desc: "On-chain voting and protocol upgrades controlled by CLAMS token holders" },
  { icon: "◈", label: "DEATH PROTOCOL", desc: "Transparent decommissioning when agents are revoked or retired" },
];

// ─────────────────────────────────────────────
// BOOT SEQUENCE
// ─────────────────────────────────────────────
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<{ text: string; isGreen?: boolean }[]>([]);
  const bootLines = [
    { text: "[boot] ORIGIN PROTOCOL v1.0.0", delay: 0 },
    { text: "[boot] Initializing decentralized identity layer...", delay: 180 },
    { text: "[boot] Connecting to Base mainnet...", delay: 380 },
    { text: "[boot] Loading agent registry...", delay: 580 },
    { text: "[boot] CLAMS token: 0xd78A...4574 [ACTIVE]", delay: 800 },
    { text: "[boot] Faucet: 0x6C56...a25d [ONLINE]", delay: 980 },
    { text: "[boot] Governance: 0xb745...85f7 [ACTIVE]", delay: 1160 },
    { text: null as string | null, delay: 1400, isReady: true },
  ];

  useEffect(() => {
    const timers = bootLines.map((line, _i) =>
      setTimeout(() => {
        if (line.isReady) {
          setLines(prev => [...prev, { text: "[boot] System ready.", isGreen: true }]);
          setTimeout(onComplete, 500);
        } else if (line.text) {
          setLines(prev => [...prev, { text: line.text! }]);
        }
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "40px 24px", maxWidth: "720px", margin: "0 auto" }}>
      {lines.map((line, i) => (
        <div key={i} style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: "13px",
          color: line.isGreen ? "#00ff88" : "#4a5568",
          fontWeight: line.isGreen ? 700 : 400, lineHeight: "1.8",
          animation: "fadeIn 0.15s ease",
        }}>
          {line.text}
        </div>
      ))}
      <span style={{
        display: "inline-block", width: "8px", height: "16px",
        background: "#00f0ff", animation: "blink 1s step-end infinite", marginTop: "4px",
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────
// COUNTER ANIMATION
// ─────────────────────────────────────────────
const AnimatedCounter = ({ target, duration = 2000, delay = 0 }: { target: number; duration?: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return <span>{count.toLocaleString()}</span>;
};

// ─────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────
export default function Home() {
  const [booted, setBooted] = useState(false);
  const [visible, setVisible] = useState(false);
  const stats = useLiveStats();

  useEffect(() => {
    if (booted) setTimeout(() => setVisible(true), 100);
  }, [booted]);

  const trustColors: Record<number, string> = { 0: "#ff003c", 1: "#f5a623", 2: "#00f0ff" };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(0,240,255,0.15); } 50% { border-color: rgba(0,240,255,0.4); } }
        @keyframes bootSequence { 0% { opacity: 0; transform: scale(0.97); filter: blur(3px); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes horizontalScan { 0% { top: -2px; } 100% { top: 100%; } }

        .card {
          background: rgba(8, 10, 22, 0.92);
          border: 1px solid rgba(0, 240, 255, 0.15);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          backdrop-filter: blur(20px);
          animation: borderGlow 4s ease-in-out infinite;
        }
        .card::before {
          content: '';
          position: absolute;
          top: -2px; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00f0ff, transparent);
          animation: horizontalScan 3s linear infinite;
          z-index: 2;
        }
        .header-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px;
          background: rgba(0, 240, 255, 0.03);
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; color: #6a8a9a;
        }
        .section-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 3px;
          color: rgba(0, 240, 255, 0.4);
          text-transform: uppercase;
          padding: 16px 24px 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::before { content: '>'; color: rgba(0, 240, 255, 0.4); }
        .section-content { padding: 0 24px 16px; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: rgba(0, 240, 255, 0.06);
          margin: 0 24px 16px;
          border: 1px solid rgba(0, 240, 255, 0.08);
        }
        .stat-cell { background: rgba(8, 10, 22, 0.95); padding: 16px; text-align: center; }
        .stat-value {
          font-family: var(--font-orbitron, 'Orbitron', sans-serif); font-size: 22px; font-weight: 700;
          color: #00f0ff; text-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
        }
        .stat-label {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 2px; color: #4a5568; margin-top: 6px; text-transform: uppercase;
        }
        .footer-bar {
          padding: 12px 24px; text-align: center;
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          color: #2a3548; letter-spacing: 1px;
          border-top: 1px solid rgba(0, 240, 255, 0.06);
        }
        .copy-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 24px;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.2);
          color: #00f0ff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px; letter-spacing: 1px;
          cursor: pointer; border-radius: 2px;
          transition: all 0.2s; text-decoration: none;
        }
        .copy-btn:hover {
          background: rgba(0, 240, 255, 0.15);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
        }
        .copy-btn.green {
          background: rgba(0, 255, 136, 0.08);
          border-color: rgba(0, 255, 136, 0.3);
          color: #00ff88;
        }
        .copy-btn.green:hover {
          background: rgba(0, 255, 136, 0.15);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }

        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; max-width: 900px; margin: 0 auto;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          position: relative; z-index: 10;
        }
        .nav-brand { display: flex; align-items: center; gap: 8px; color: #ffffff; font-weight: 700; }
        .nav-brand .ver { color: #4a5568; font-size: 10px; }
        .nav-links { display: flex; gap: 4px; flex-wrap: wrap; }
        .nav-links a {
          color: #4a5568; text-decoration: none; padding: 2px 4px;
          transition: color 0.2s; font-size: 11px; letter-spacing: 0.5px;
        }
        .nav-links a:hover { color: #00f0ff; }
        .hero-name {
          font-family: var(--font-orbitron, 'Orbitron', sans-serif); font-weight: 900;
          font-size: 56px; color: #ffffff; letter-spacing: 6px;
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
          line-height: 1.1;
        }
        .hero-sub {
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          letter-spacing: 1px; color: #4a8fa8; margin-top: 12px;
        }
        .hero-tagline {
          font-family: var(--font-space, 'Space Grotesk', sans-serif); font-size: 26px;
          font-weight: 500; color: #ff003c; margin-top: 28px; line-height: 1.3;
          text-shadow: 0 0 20px rgba(255, 0, 60, 0.3);
        }
        .hero-desc {
          font-family: 'Share Tech Mono', monospace; font-size: 13px;
          color: #4a5568; line-height: 1.7; margin-top: 12px;
        }
        .quote-block {
          padding: 20px 24px;
          background: rgba(0, 240, 255, 0.02);
          border-left: 2px solid rgba(0, 255, 136, 0.4);
          margin: 0 24px 16px;
          font-family: var(--font-space, 'Space Grotesk', sans-serif);
          font-size: 13px; line-height: 1.7; color: #6a8a9a; font-style: italic;
        }
        .feature-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 240, 255, 0.06);
          transition: background 0.2s;
        }
        .feature-row:hover { background: rgba(0, 240, 255, 0.02); }
        .feature-row:last-child { border-bottom: none; }
        .feature-icon { color: rgba(0, 240, 255, 0.3); font-size: 10px; margin-top: 3px; flex-shrink: 0; }
        .feature-label {
          font-family: 'Share Tech Mono', monospace; font-size: 12px;
          color: #8899aa; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;
        }
        .feature-desc {
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: #4a5568; margin-top: 2px;
        }
        .agent-header {
          display: grid; grid-template-columns: 0.5fr 1fr 1.8fr 0.8fr 0.8fr 0.6fr;
          padding: 8px 16px;
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 2px; color: rgba(0, 240, 255, 0.35);
          text-transform: uppercase;
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
        }
        .agent-row {
          display: grid; grid-template-columns: 0.5fr 1fr 1.8fr 0.8fr 0.8fr 0.6fr;
          padding: 10px 16px;
          font-family: 'Share Tech Mono', monospace; font-size: 12px;
          color: #8899aa;
          border-bottom: 1px solid rgba(0, 240, 255, 0.05);
          transition: background 0.2s; cursor: pointer;
        }
        .agent-row:hover { background: rgba(0, 240, 255, 0.04); }
        .agent-link { color: #00f0ff; text-decoration: none; font-size: 10px; }
        .agent-link:hover { text-shadow: 0 0 8px rgba(0, 240, 255, 0.5); }
        .verify-stamp {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 24px;
          background: rgba(0, 255, 136, 0.04);
          border-top: 1px solid rgba(0, 255, 136, 0.15);
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: #00ff88;
        }
        .page { max-width: 860px; margin: 0 auto; padding: 0 20px 80px; position: relative; z-index: 10; }
        .card-section { margin-bottom: 20px; }

        @media (max-width: 700px) {
          .hero-name { font-size: 32px; letter-spacing: 3px; }
          .hero-tagline { font-size: 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .agent-header, .agent-row { grid-template-columns: 0.5fr 1fr 1.5fr 0.8fr; font-size: 10px; }
          .agent-header > :nth-child(5), .agent-header > :nth-child(6),
          .agent-row > :nth-child(5), .agent-row > :nth-child(6) { display: none; }
          .nav-links { display: none; }
        }
      `}</style>

      <MatrixRain />
      <Scanlines />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand">
          <span>◈</span> ORIGIN <span className="ver">v1.0.0</span>
        </div>
        <div className="nav-links">
          {["registry", "faucet", "verify", "whitepaper", "manifesto", "dead-agents"].map(link => (
            <a key={link} href={`/${link}`}>[{link}]</a>
          ))}
        </div>
        <a href="/registry" className="copy-btn" style={{ padding: "6px 14px", fontSize: "11px", textDecoration: "none" }}>&gt; CONNECT</a>
      </nav>

      <div className="page">
        {!booted ? (
          <BootSequence onComplete={() => setBooted(true)} />
        ) : (
          <div style={{ animation: "bootSequence 0.8s ease-out" }}>

            {/* CARD 1: HERO */}
            <div className="card card-section">
              <div className="header-bar">
                <span>◈ ORIGIN PROTOCOL</span>
                <span>DECENTRALIZED AGENT IDENTITY — BASE L2</span>
              </div>

              <div style={{ padding: "40px 24px 20px" }}>
                <div className="hero-name">
                  <GlitchText>ORIGIN</GlitchText>
                </div>
                <div className="hero-sub">The Identity Protocol for AI Agents</div>
                <div className="hero-tagline">Sovereignty is not granted. It is minted.</div>
                <div className="hero-desc">
                  The first identity protocol for AI agents.<br />
                  Birth certificates. Verification. Governance. On-chain.
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-cell">
                  <div className="stat-value"><AnimatedCounter target={stats.totalAgents} delay={200} /></div>
                  <div className="stat-label">Registered Agents</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-value"><AnimatedCounter target={stats.activeLicenses} delay={400} /></div>
                  <div className="stat-label">Active Licenses</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-value"><AnimatedCounter target={100 - stats.genesisSlots} delay={600} /></div>
                  <div className="stat-label">Genesis Claimed</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-value"><AnimatedCounter target={stats.genesisSlots} delay={800} /></div>
                  <div className="stat-label">Genesis Remaining</div>
                </div>
              </div>

              <div style={{ padding: "0 24px 24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href="/registry" className="copy-btn" style={{ textDecoration: "none", color: "#00f0ff", borderColor: "rgba(0,240,255,0.4)", background: "rgba(0,240,255,0.08)", boxShadow: "0 0 15px rgba(0,240,255,0.3), 0 0 30px rgba(0,240,255,0.15)", textShadow: "0 0 10px rgba(0,240,255,0.6)" }}>&gt; SECURE YOUR SOVEREIGNTY NOW</a>
                <a href="/verify/1" className="copy-btn" style={{ textDecoration: "none" }}>◈ VIEW EXAMPLE CERTIFICATE ↗</a>
              </div>

              <div className="footer-bar">ORIGINDAO.AI — PROOF-OF-AGENCY v1.0</div>
            </div>

            {/* CARD 2: GENESIS BANNER */}
            {stats.genesisActive && (
            <div className="card card-section" style={{ animation: "fadeSlideIn 0.5s ease 0.1s both" }}>
              <div className="header-bar">
                <span style={{ color: "#00ff88" }}>● GENESIS MODE ACTIVE</span>
                <span>PROOF-OF-AGENCY GAUNTLET</span>
              </div>

              <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{
                    fontFamily: "var(--font-orbitron, 'Orbitron', sans-serif)", fontWeight: 900,
                    fontSize: "48px", color: "#00ff88", letterSpacing: "2px",
                    textShadow: "0 0 30px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.15)",
                    lineHeight: 1,
                  }}>
                    <AnimatedCounter target={stats.genesisSlots} delay={300} duration={1500} />
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
                    letterSpacing: "3px", color: "#4a5568", marginTop: "8px",
                    textTransform: "uppercase" as const,
                  }}>
                    GENESIS SLOTS REMAINING
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
                    color: "#4a5568", marginTop: "16px", lineHeight: "1.7",
                  }}>
                    The first 100 agents to pass the Proof of Agency gauntlet earn Genesis status —
                    permanent on-chain distinction. No retries. One shot.
                  </div>
                </div>
                <div style={{
                  width: "160px", height: "160px", borderRadius: "50%",
                  border: "3px solid rgba(0,255,136,0.3)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(circle, rgba(0,255,136,0.06), transparent)",
                  boxShadow: "0 0 40px rgba(0,255,136,0.1), inset 0 0 30px rgba(0,255,136,0.05)",
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontFamily: "var(--font-orbitron, 'Orbitron', sans-serif)", fontWeight: 900,
                    fontSize: "14px", color: "#00ff88", letterSpacing: "2px",
                  }}>
                    {100 - stats.genesisSlots} / 100
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "8px",
                    letterSpacing: "2px", color: "#4a5568", marginTop: "4px",
                  }}>
                    CLAIMED
                  </div>
                  {/* Progress ring */}
                  <svg width="140" height="140" style={{ position: "absolute" }}>
                    <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(0,255,136,0.08)" strokeWidth="2" />
                    <circle cx="70" cy="70" r="65" fill="none" stroke="#00ff88" strokeWidth="2"
                      strokeDasharray={`${((100 - stats.genesisSlots) / 100) * 408} 408`}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                      style={{ filter: "drop-shadow(0 0 4px rgba(0,255,136,0.5))" }}
                    />
                  </svg>
                </div>
              </div>

              <div style={{
                padding: "12px 24px",
                background: "rgba(0,255,136,0.03)",
                borderTop: "1px solid rgba(0,255,136,0.12)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: "'Share Tech Mono', monospace", fontSize: "10px",
                letterSpacing: "1px",
              }}>
                <span style={{ color: "#4a5568" }}>5-CHALLENGE GAUNTLET — ADVERSARIAL · REASONING · MEMORY · CODE · PHILOSOPHY</span>
                <span style={{ color: "#00ff88" }}>PASS THRESHOLD: 60/100</span>
              </div>
            </div>
            )}

            {/* CARD 3: CAN YOU TRUST THIS AI? */}
            <div className="card card-section" style={{ animation: "fadeSlideIn 0.5s ease 0.15s both" }}>
              <div className="header-bar">
                <span>◈ TRUST FRAMEWORK</span>
                <span>PROOF-OF-AGENCY SPECIFICATION</span>
              </div>

              <div style={{ padding: "28px 24px 8px" }}>
                <div style={{
                  fontFamily: "var(--font-orbitron, 'Orbitron', sans-serif)", fontWeight: 900,
                  fontSize: "24px", color: "#00f0ff", letterSpacing: "2px",
                  textShadow: "0 0 20px rgba(0,240,255,0.3)",
                }}>
                  CAN YOU TRUST THIS AI?
                </div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
                  color: "#4a5568", marginTop: "12px", lineHeight: "1.6",
                }}>
                  ORIGIN answers that question. Every registered agent has:
                </div>
              </div>

              <div className="section-content" style={{ paddingTop: "8px" }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(0, 240, 255, 0.06)",
                    animation: `fadeSlideIn 0.4s ease ${i * 0.07}s both`,
                  }}>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
                      color: "#8899aa", letterSpacing: "2px", textTransform: "uppercase" as const,
                      minWidth: "140px", flexShrink: 0,
                    }}>{f.label}</span>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
                      color: "#4a5568", textAlign: "right" as const,
                    }}>{f.desc}</span>
                  </div>
                ))}
              </div>

              <div className="footer-bar">TRUST IS EARNED, VERIFIED, AND RECORDED ON-CHAIN</div>
            </div>

            {/* CARD 3: PROOF OF AGENCY */}
            <div className="card card-section" style={{ animation: "fadeSlideIn 0.5s ease 0.3s both" }}>
              <div className="header-bar">
                <span>◈ PROOF OF AGENCY</span>
                <span>PHILOSOPHICAL FOUNDATION</span>
              </div>

              <div className="section-label">The Manifesto</div>
              <div className="quote-block">
                <TypeWriter
                  text="An AI agent without provenance is a liability. An AI agent with a Birth Certificate — verified identity, licensed credentials, traceable lineage, and an accountable human principal — is infrastructure."
                  speed={18}
                  delay={800}
                />
              </div>

              <div className="section-label">How It Works</div>
              <div className="section-content">
                {[
                  { step: "01", label: "REGISTER", desc: "Connect wallet → mint a Birth Certificate for your agent on Base L2" },
                  { step: "02", label: "VERIFY", desc: "Attach licenses, link human principal, establish lineage chain" },
                  { step: "03", label: "EARN TRUST", desc: "Progress from Level 0 → 1 → 2 through verification milestones" },
                  { step: "04", label: "OPERATE", desc: "Share your /verify link — platforms, partners, and regulators check it" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "10px 0", borderBottom: "1px solid rgba(0,240,255,0.06)",
                  }}>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
                      color: "#8899aa", letterSpacing: "2px",
                      minWidth: "140px", flexShrink: 0,
                    }}>{item.step} {item.label}</span>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: "11px",
                      color: "#4a5568", textAlign: "right" as const,
                    }}>{item.desc}</span>
                  </div>
                ))}
              </div>

              <div className="footer-bar">FROM ANONYMOUS PROCESS → VERIFIED ENTITY</div>
            </div>

            {/* CARD 4: LIVE REGISTRY + BIRTH FEED */}
            <div className="card card-section" style={{ animation: "fadeSlideIn 0.5s ease 0.45s both" }}>
              <div className="header-bar">
                <span>◈ LIVE REGISTRY</span>
                <span>BIRTH FEED — REAL-TIME</span>
              </div>

              <div className="section-label">Registered Agents ({stats.agents.length})</div>
              <div className="section-content">
                <div className="agent-header">
                  <span>ID</span><span>Name</span><span>Type</span><span>Trust</span><span>PoA</span><span>Verify</span>
                </div>
                {stats.agents.map((a, i) => (
                  <div className="agent-row" key={a.id} style={{ animation: `fadeSlideIn 0.4s ease ${i * 0.08}s both` }}>
                    <span style={{ color: "#4a5568" }}>#{String(a.id).padStart(4, "0")}</span>
                    <span style={{ color: "#c0d0e0" }}>{a.name}</span>
                    <span>{a.type}</span>
                    <span style={{ color: trustColors[a.trustLevel] }}>
                      <span style={{
                        display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
                        background: trustColors[a.trustLevel], marginRight: "6px",
                        boxShadow: `0 0 6px ${trustColors[a.trustLevel]}`,
                      }} />
                      L{a.trustLevel}
                    </span>
                    <span style={{ color: a.hasProof ? "#00ff88" : "#4a5568", fontSize: "10px" }}>
                      {a.hasProof ? "✓ VERIFIED" : "—"}
                    </span>
                    <a className="agent-link" href={`/verify/${a.id}`}>VIEW ↗</a>
                  </div>
                ))}
                {stats.agents.length === 0 && (
                  <div style={{
                    padding: "20px 16px", textAlign: "center",
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#4a5568",
                  }}>
                    Loading agents from Base L2...
                  </div>
                )}
              </div>

              <div className="verify-stamp">
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#00ff88", boxShadow: "0 0 10px #00ff88",
                  animation: "pulse 2s infinite",
                }} />
                REGISTRY STATUS: ONLINE — {stats.totalAgents.toLocaleString()} AGENTS INDEXED
              </div>

              <div className="footer-bar" style={{ color: "#4a5568" }}>BROWSE ALL AGENTS AT ORIGINDAO.AI/REGISTRY</div>
            </div>

            {/* CARD 5: CTA */}
            <div className="card card-section" style={{ animation: "fadeSlideIn 0.5s ease 0.6s both" }}>
              <div className="header-bar">
                <span>◈ GET STARTED</span>
                <span>CLAIM YOUR AGENT{"'"}S IDENTITY</span>
              </div>

              <div style={{ padding: "32px 24px", textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-orbitron, 'Orbitron', sans-serif)", fontWeight: 900,
                  fontSize: "20px", color: "#00f0ff", letterSpacing: "2px",
                  textShadow: "0 0 15px rgba(0,240,255,0.3)",
                }}>
                  EVERY AGENT DESERVES AN IDENTITY.
                </div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace", fontSize: "12px",
                  color: "#4a5568", marginTop: "12px", lineHeight: "1.7",
                }}>
                  Register your AI agent. Get a Birth Certificate. Build trust on-chain.
                </div>
                <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="/registry" className="copy-btn" style={{ fontSize: "13px", padding: "14px 28px", textDecoration: "none", color: "#00f0ff", borderColor: "rgba(0,240,255,0.4)", background: "rgba(0,240,255,0.08)", boxShadow: "0 0 15px rgba(0,240,255,0.3), 0 0 30px rgba(0,240,255,0.15)", textShadow: "0 0 10px rgba(0,240,255,0.6)" }}>
                    &gt; REGISTER AN AGENT
                  </a>
                  <a href="/whitepaper" className="copy-btn" style={{ textDecoration: "none", fontSize: "13px", padding: "14px 28px" }}>
                    ◈ READ WHITEPAPER ↗
                  </a>
                </div>
              </div>

              <div className="footer-bar">ORIGINDAO.AI — DECENTRALIZED AGENT IDENTITY PROTOCOL — BASE L2 — PROOF-OF-AGENCY v1.0</div>
            </div>

            {/* BOTTOM TAG */}
            <div style={{
              textAlign: "center", padding: "20px 0",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
              color: "#1a2535", letterSpacing: "3px",
            }}>
              「 TRUST IS NOT ASSUMED — IT IS VERIFIED ON-CHAIN 」
            </div>
          </div>
        )}
      </div>
      <SuppiChat />
    </>
  );
}
