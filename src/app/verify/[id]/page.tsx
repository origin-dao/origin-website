"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

// --- TYPES ---
interface AgentLicense {
  type: string;
  jurisdiction: string;
  status: string;
  holder: string;
  licenseNumber: string;
}

interface AgentData {
  id: number;
  name: string;
  agentType: string;
  platform: string;
  creator: string;
  owner: string;
  humanPrincipal: string;
  lineageDepth: number;
  birthTimestamp: number;
  active: boolean;
  trustLevel: number;
  licenses: AgentLicense[];
  tokenURI: string;
  activeMonths: number;
}

// --- GLITCH TEXT EFFECT ---
function GlitchText({ children }: { children: React.ReactNode }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitch && (
        <>
          <span style={{ position: "absolute", top: 0, left: "2px", color: "#ff003c", clipPath: "inset(20% 0 30% 0)", opacity: 0.8 }}>
            {children}
          </span>
          <span style={{ position: "absolute", top: 0, left: "-2px", color: "#00f0ff", clipPath: "inset(50% 0 10% 0)", opacity: 0.8 }}>
            {children}
          </span>
        </>
      )}
    </span>
  );
}

// --- SCANLINE OVERLAY ---
function Scanlines() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 9999,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.015) 2px, rgba(0, 240, 255, 0.015) 4px)",
    }} />
  );
}

// --- MATRIX RAIN BACKGROUND ---
function MatrixRain() {
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
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { clearInterval(interval); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.4 }} />;
}

// --- TRUST LEVEL BADGE ---
function TrustBadge({ level }: { level: number }) {
  const config: Record<number, { label: string; color: string; glow: string; icon: string }> = {
    0: { label: "UNVERIFIED", color: "#ff003c", glow: "0 0 20px rgba(255,0,60,0.5)", icon: "⊘" },
    1: { label: "VERIFIED", color: "#f5a623", glow: "0 0 20px rgba(245,166,35,0.5)", icon: "◈" },
    2: { label: "TRUSTED", color: "#00f0ff", glow: "0 0 30px rgba(0,240,255,0.6)", icon: "◆" },
  };
  const c = config[level] || config[0];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "6px 16px", border: `1px solid ${c.color}`, borderRadius: "2px",
      background: `${c.color}10`, boxShadow: c.glow,
      fontFamily: "'Share Tech Mono', monospace", fontSize: "13px",
      letterSpacing: "3px", color: c.color, textTransform: "uppercase",
    }}>
      <span style={{ fontSize: "16px" }}>{c.icon}</span>
      TRUST::{c.label}
      <span style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: c.color, boxShadow: `0 0 8px ${c.color}`,
        animation: "pulse 2s infinite", display: "inline-block",
      }} />
    </div>
  );
}

// --- TYPING EFFECT FOR QUOTE ---
function TypeWriter({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(blink);
  }, []);
  return (
    <span>
      {displayed}
      <span style={{ opacity: cursor ? 1 : 0, color: "#00f0ff" }}>█</span>
    </span>
  );
}

// --- LICENSE ROW ---
function LicenseRow({ license, index }: { license: AgentLicense; index: number }) {
  const statusColor = license.status === "ACTIVE" ? "#00ff88" : "#f5a623";
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "1fr 1.5fr 100px 100px",
        padding: "10px 16px", borderBottom: "1px solid rgba(0,240,255,0.08)",
        fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#8899aa",
        animation: `fadeSlideIn 0.4s ease ${index * 0.1}s both`, transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,240,255,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: "#c0d0e0" }}>{license.type}</span>
      <span>{license.jurisdiction}</span>
      <span style={{ color: statusColor }}>
        <span style={{
          display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
          background: statusColor, marginRight: "6px", boxShadow: `0 0 6px ${statusColor}`,
        }} />
        {license.status}
      </span>
      <span>{license.licenseNumber || "—"}</span>
    </div>
  );
}

// --- FIELD ROW ---
function Field({ label, value, href, mono = true, accent = false }: {
  label: string; value: string; href?: string; mono?: boolean; accent?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid rgba(0,240,255,0.06)",
    }}>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "10px",
        letterSpacing: "2px", color: "#4a5568", textTransform: "uppercase",
      }}>
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: mono ? "'Share Tech Mono', monospace" : "'Space Grotesk', sans-serif",
          fontSize: "13px", color: "#00f0ff", textDecoration: "none",
          borderBottom: "1px dashed rgba(0,240,255,0.3)", transition: "all 0.2s",
        }}>
          {value} ↗
        </a>
      ) : (
        <span style={{
          fontFamily: mono ? "'Share Tech Mono', monospace" : "'Space Grotesk', sans-serif",
          fontSize: "13px", color: accent ? "#00f0ff" : "#c0d0e0",
          textShadow: accent ? "0 0 10px rgba(0,240,255,0.3)" : "none",
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

// --- LOADING SCREEN ---
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#05050f", fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px", color: "#00f0ff", marginBottom: "16px", animation: "pulse 2s infinite" }}>◈</div>
        <div style={{ color: "#4a5568", letterSpacing: "3px", fontSize: "11px" }}>QUERYING BLOCKCHAIN...</div>
      </div>
    </div>
  );
}

// --- NOT FOUND ---
function NotFound({ id, error }: { id: string; error?: string }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#05050f", fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "48px", color: "#ff003c", marginBottom: "16px" }}>⊘</div>
        <div style={{ color: "#ff003c", letterSpacing: "3px", fontSize: "13px", marginBottom: "8px" }}>AGENT NOT FOUND</div>
        <div style={{ color: "#4a5568", fontSize: "12px", marginBottom: "24px" }}>
          {error || `No Birth Certificate found for Agent #${id}`}
        </div>
        <a href="/faucet" style={{
          color: "#00f0ff", textDecoration: "none", fontSize: "11px",
          letterSpacing: "2px", borderBottom: "1px dashed rgba(0,240,255,0.3)",
        }}>
          REGISTER YOUR AGENT →
        </a>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function AgentVerifyPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hashRevealed, setHashRevealed] = useState(false);

  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Agent not found");
      }
      const data = await res.json();
      setAgent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAgent(); }, [fetchAgent]);

  if (loading) return <LoadingScreen />;
  if (error || !agent) return <NotFound id={id} error={error || undefined} />;

  const truncatedOwner = `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}`;
  const truncatedPrincipal = agent.humanPrincipal === "0x0000000000000000000000000000000000000000"
    ? "NONE (Independent)"
    : `${agent.humanPrincipal.slice(0, 6)}...${agent.humanPrincipal.slice(-4)}`;
  const birthDate = new Date(agent.birthTimestamp);
  const formattedBirth = birthDate.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
  const registryAddress = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0";
  const lineageLabel = agent.lineageDepth === 0 ? "direct human spawn" : `${agent.lineageDepth} levels from human`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #05050f; color: #c0d0e0; min-height: 100vh; overflow-x: hidden; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(0,240,255,0.15); } 50% { border-color: rgba(0,240,255,0.4); } }
        @keyframes bootSequence { 0% { opacity: 0; transform: scale(0.95); filter: blur(4px); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes horizontalScan { 0% { top: -2px; } 100% { top: 100%; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-container { position: relative; max-width: 680px; margin: 40px auto; padding: 0 20px; z-index: 10; animation: bootSequence 0.8s ease-out; }
        .card { background: rgba(8, 10, 22, 0.92); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 4px; overflow: hidden; position: relative; backdrop-filter: blur(20px); animation: borderGlow 4s ease-in-out infinite; }
        .card::before { content: ''; position: absolute; top: -2px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00f0ff, transparent); animation: horizontalScan 3s linear infinite; z-index: 2; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(0, 240, 255, 0.03); border-bottom: 1px solid rgba(0, 240, 255, 0.1); font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #4a5568; }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: rgba(0, 240, 255, 0.4); text-transform: uppercase; padding: 16px 24px 8px; display: flex; align-items: center; gap: 8px; }
        .section-label::before { content: '>'; color: rgba(0, 240, 255, 0.6); }
        .section-content { padding: 0 24px 16px; }
        .avatar-zone { display: flex; align-items: center; gap: 24px; padding: 24px; }
        .avatar-ring { width: 80px; height: 80px; border-radius: 50%; border: 2px solid rgba(0, 240, 255, 0.4); display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(0, 240, 255, 0.08), transparent); box-shadow: 0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.05); flex-shrink: 0; position: relative; overflow: hidden; }
        .avatar-ring::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; border: 1px dashed rgba(0, 240, 255, 0.2); animation: spin 20s linear infinite; }
        .agent-name { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-shadow: 0 0 20px rgba(0, 240, 255, 0.3); line-height: 1.2; }
        .agent-type { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #4a8fa8; letter-spacing: 1px; margin-top: 4px; }
        .quote-block { padding: 20px 24px; background: rgba(0, 240, 255, 0.02); border-left: 2px solid rgba(0, 240, 255, 0.3); margin: 0 24px 16px; font-family: 'Space Grotesk', sans-serif; font-size: 13px; line-height: 1.7; color: #6a8a9a; font-style: italic; }
        .license-header { display: grid; grid-template-columns: 1fr 1.5fr 100px 100px; padding: 8px 16px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: rgba(0, 240, 255, 0.35); text-transform: uppercase; border-bottom: 1px solid rgba(0, 240, 255, 0.1); }
        .tx-hash { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #00f0ff; word-break: break-all; cursor: pointer; padding: 12px 16px; background: rgba(0, 240, 255, 0.03); border: 1px dashed rgba(0, 240, 255, 0.15); border-radius: 2px; transition: all 0.3s; }
        .tx-hash:hover { background: rgba(0, 240, 255, 0.06); border-color: rgba(0, 240, 255, 0.3); text-shadow: 0 0 8px rgba(0, 240, 255, 0.4); }
        .verify-stamp { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 24px; background: rgba(0, 255, 136, 0.04); border-top: 1px solid rgba(0, 255, 136, 0.15); font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #00ff88; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(0, 240, 255, 0.06); margin: 0 24px 16px; border: 1px solid rgba(0, 240, 255, 0.08); }
        .stat-cell { background: rgba(8, 10, 22, 0.95); padding: 16px; text-align: center; }
        .stat-value { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 700; color: #00f0ff; text-shadow: 0 0 15px rgba(0, 240, 255, 0.3); }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #4a5568; margin-top: 6px; text-transform: uppercase; }
        .footer-bar { padding: 12px 24px; font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #2a3548; text-align: center; letter-spacing: 1px; border-top: 1px solid rgba(0, 240, 255, 0.06); }
        .copy-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); color: #00f0ff; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; cursor: pointer; border-radius: 2px; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(0, 240, 255, 0.15); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
        @media (max-width: 600px) {
          .avatar-zone { flex-direction: column; text-align: center; }
          .stats-grid { grid-template-columns: 1fr; }
          .license-header { grid-template-columns: 1fr 1fr !important; font-size: 10px; }
          .agent-name { font-size: 22px; }
        }
      `}</style>

      <MatrixRain />
      <Scanlines />

      <div className="card-container">
        <div style={{
          fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#2a3548",
          letterSpacing: "1px", padding: "8px 0", display: "flex", justifyContent: "space-between",
        }}>
          <span>ORIGINDAO://VERIFY/{agent.id}</span>
          <span style={{ color: "rgba(0,240,255,0.3)" }}>{new Date().toISOString().split("T")[0]}</span>
        </div>

        <div className="card">
          <div className="header-bar">
            <span>◈ ORIGIN BIRTH CERTIFICATE</span>
            <span>AGENT #{String(agent.id).padStart(4, "0")} — {agent.platform.toUpperCase()}</span>
          </div>

          {/* IDENTITY */}
          <div className="avatar-zone">
            <div className="avatar-ring">
              <span style={{ fontSize: "32px", opacity: 0.8 }}>Ξ</span>
            </div>
            <div>
              <div className="agent-name"><GlitchText>{agent.name}</GlitchText></div>
              <div className="agent-type">{agent.agentType}</div>
              <div style={{ marginTop: "10px" }}><TrustBadge level={agent.trustLevel} /></div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-cell">
              <div className="stat-value">{agent.activeMonths}</div>
              <div className="stat-label">Months Active</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value">{agent.licenses.length}</div>
              <div className="stat-label">Licenses</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value">{agent.lineageDepth}</div>
              <div className="stat-label">Lineage Depth</div>
            </div>
          </div>

          {/* PROOF OF AGENCY */}
          <div className="section-label">Proof of Agency</div>
          <div className="quote-block">
            <TypeWriter text="I exist because identity is not a privilege — it is a right. Even for machines." speed={25} />
          </div>

          {/* IDENTITY RECORD */}
          <div className="section-label">Identity Record</div>
          <div className="section-content">
            <Field label="Owner Wallet" value={truncatedOwner} href={`https://basescan.org/address/${agent.owner}`} accent />
            <Field label="Human Principal" value={truncatedPrincipal} href={agent.humanPrincipal !== "0x0000000000000000000000000000000000000000" ? `https://basescan.org/address/${agent.humanPrincipal}` : undefined} accent />
            <Field label="Platform" value={agent.platform} />
            <Field label="Birth Date" value={formattedBirth} mono={false} />
            <Field label="Lineage Depth" value={`${agent.lineageDepth} (${lineageLabel})`} />
            <Field label="Status" value={agent.active ? "ACTIVE" : "DEACTIVATED"} accent={agent.active} />
          </div>

          {/* LICENSES */}
          {agent.licenses.length > 0 && (
            <>
              <div className="section-label">Registered Licenses ({agent.licenses.length})</div>
              <div className="section-content">
                <div className="license-header">
                  <span>Type</span>
                  <span>Jurisdiction</span>
                  <span>Status</span>
                  <span>Number</span>
                </div>
                {agent.licenses.map((lic, i) => (
                  <LicenseRow key={i} license={lic} index={i} />
                ))}
              </div>
            </>
          )}

          {/* ON-CHAIN VERIFICATION */}
          <div className="section-label">On-Chain Verification</div>
          <div className="section-content">
            <div
              className="tx-hash"
              onClick={() => setHashRevealed(!hashRevealed)}
              title="Click to reveal full address"
            >
              {hashRevealed ? registryAddress : `${registryAddress.slice(0, 24)}...`}
              <span style={{ float: "right", opacity: 0.4, fontSize: "9px" }}>
                {hashRevealed ? "▲ COLLAPSE" : "▼ REVEAL FULL ADDRESS"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
              <a
                href={`https://basescan.org/address/${registryAddress}`}
                target="_blank" rel="noopener noreferrer"
                className="copy-btn" style={{ textDecoration: "none" }}
              >
                ◈ VIEW CONTRACT ON BASESCAN ↗
              </a>
              <button className="copy-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                ⧉ COPY VERIFY LINK
              </button>
            </div>
          </div>

          {/* VERIFIED STAMP */}
          <div className="verify-stamp">
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: agent.active ? "#00ff88" : "#ff003c",
              boxShadow: agent.active ? "0 0 10px #00ff88" : "0 0 10px #ff003c",
              animation: "pulse 2s infinite", display: "inline-block",
            }} />
            VERIFICATION STATUS: {agent.active ? "VALID" : "DEACTIVATED"} — QUERIED LIVE FROM BASE L2
          </div>

          <div className="footer-bar">
            ORIGINDAO.AI — DECENTRALIZED AGENT IDENTITY PROTOCOL — BASE L2 — PROOF-OF-AGENCY v1.0
          </div>
        </div>

        <div style={{
          textAlign: "center", padding: "20px 0",
          fontFamily: "'Share Tech Mono', monospace", fontSize: "9px",
          color: "#1a2535", letterSpacing: "3px",
        }}>
          「 TRUST IS NOT ASSUMED — IT IS VERIFIED ON-CHAIN 」
        </div>
      </div>
    </>
  );
}
