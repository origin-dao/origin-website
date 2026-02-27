"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AgentLicense {
  name: string;
  id?: string;
  status: "ACTIVE" | "PENDING" | "REVOKED" | "EXPIRED";
}

export interface AgentData {
  id: number;
  name: string;
  type: string;
  owner: string;
  principal?: string;
  wallet?: string;
  birthBlock: number;
  birthDate: string;
  trustLevel: number; // 0=Unverified, 1=Verified, 2=Licensed
  licenses: AgentLicense[];
  lineageDepth: number;
  totalTransactions: number;
  monthsActive: number;
  philosophicalFlex: string;
  txHash?: string;
  tokenURI?: string;
  avatarUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// MATRIX RAIN BACKGROUND
// ═══════════════════════════════════════════════════════════════

const ORIGIN_CHARS = "ORIGINDAO01アイデンティティ信頼検証ΨΩΔΣπ⟐◆◇▣▤▥";

function MatrixRain({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const fontSize = 12;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(0, 255, 65, 0.15)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = ORIGIN_CHARS[Math.floor(Math.random() * ORIGIN_CHARS.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// GLITCH TEXT EFFECT
// ═══════════════════════════════════════════════════════════════

function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-text relative inline-block ${className}`}>
      <span className="glitch-text-main">{text}</span>
      <span className="glitch-text-r absolute top-0 left-0" aria-hidden="true">{text}</span>
      <span className="glitch-text-c absolute top-0 left-0" aria-hidden="true">{text}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// TRUST LEVEL INDICATOR
// ═══════════════════════════════════════════════════════════════

const TRUST_LEVELS = [
  { label: "UNVERIFIED", color: "#ff3333", glowColor: "rgba(255, 51, 51, 0.6)" },
  { label: "VERIFIED", color: "#ffb000", glowColor: "rgba(255, 176, 0, 0.6)" },
  { label: "LICENSED", color: "#00ffff", glowColor: "rgba(0, 255, 255, 0.6)" },
];

function TrustLevelBadge({ level }: { level: number }) {
  const trust = TRUST_LEVELS[level] || TRUST_LEVELS[0];
  return (
    <div className="flex items-center gap-2">
      <div
        className="trust-pulse w-3 h-3 rounded-full"
        style={{
          backgroundColor: trust.color,
          boxShadow: `0 0 8px ${trust.glowColor}, 0 0 16px ${trust.glowColor}`,
        }}
      />
      <span
        className="text-sm font-bold tracking-widest"
        style={{ color: trust.color, textShadow: `0 0 10px ${trust.glowColor}` }}
      >
        TRUST LEVEL {level}: {trust.label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TYPEWRITER QUOTE
// ═══════════════════════════════════════════════════════════════

function TypewriterQuote({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="text-sm italic text-terminal-dim leading-relaxed">
      <span className="text-terminal-amber">&ldquo;</span>
      {displayed}
      {!done && <span className="cursor-blink" />}
      <span className="text-terminal-amber">&rdquo;</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LICENSE TABLE
// ═══════════════════════════════════════════════════════════════

function LicenseTable({ licenses }: { licenses: AgentLicense[] }) {
  const statusColor = (s: string) => {
    switch (s) {
      case "ACTIVE": return "#00ff41";
      case "PENDING": return "#ffb000";
      case "REVOKED": return "#ff3333";
      case "EXPIRED": return "#666";
      default: return "#666";
    }
  };

  return (
    <div className="space-y-1">
      <div className="text-xs text-terminal-dim tracking-widest mb-2">LICENSES</div>
      {licenses.map((lic, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-terminal-green">
            {lic.name}
            {lic.id && <span className="text-terminal-dim ml-1">({lic.id})</span>}
          </span>
          <span
            className="font-bold tracking-wider"
            style={{ color: statusColor(lic.status) }}
          >
            ● {lic.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COLLAPSIBLE TX HASH
// ═══════════════════════════════════════════════════════════════

function TxHashReveal({ hash, label = "TX HASH" }: { hash: string; label?: string }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "N/A";

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(hash);
  }, [hash]);

  return (
    <div className="text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-terminal-dim hover:text-terminal-amber transition-colors cursor-pointer"
      >
        {label}: {expanded ? hash : truncated} {expanded ? "▼" : "▶"}
      </button>
      {expanded && (
        <div className="flex gap-2 mt-1 ml-2">
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terminal-amber hover:text-terminal-green text-xs"
          >
            [BaseScan ↗]
          </a>
          <button
            onClick={copyToClipboard}
            className="text-terminal-amber hover:text-terminal-green text-xs cursor-pointer"
          >
            [Copy]
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION STAMP
// ═══════════════════════════════════════════════════════════════

function VerificationStamp({ agent }: { agent: AgentData }) {
  const [lastChecked, setLastChecked] = useState<string>("");

  useEffect(() => {
    setLastChecked(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
  }, []);

  const verifyUrl = `https://origindao.ai/verify/${agent.id}`;

  const copyVerifyLink = useCallback(() => {
    navigator.clipboard.writeText(verifyUrl);
  }, [verifyUrl]);

  return (
    <div className="border border-terminal-dim/30 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 trust-pulse" />
        <span className="text-xs text-terminal-green tracking-widest font-bold">
          ON-CHAIN VERIFIED
        </span>
      </div>
      <div className="text-xs text-terminal-dim">
        LAST CHECKED: <span className="text-terminal-green">{lastChecked}</span>
      </div>
      <div className="flex gap-2">
        <a
          href={`https://basescan.org/address/${agent.wallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-terminal-amber hover:text-terminal-green"
        >
          [Verify on BaseScan ↗]
        </a>
        <button
          onClick={copyVerifyLink}
          className="text-xs text-terminal-amber hover:text-terminal-green cursor-pointer"
        >
          [Copy Verify Link]
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS GRID
// ═══════════════════════════════════════════════════════════════

function StatsGrid({ agent }: { agent: AgentData }) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-lg font-bold text-terminal-amber glow-amber">{agent.monthsActive}</div>
        <div className="text-xs text-terminal-dim">MONTHS ACTIVE</div>
      </div>
      <div>
        <div className="text-lg font-bold text-terminal-amber glow-amber">{agent.totalTransactions}</div>
        <div className="text-xs text-terminal-dim">TRANSACTIONS</div>
      </div>
      <div>
        <div className="text-lg font-bold text-terminal-amber glow-amber">{agent.lineageDepth}</div>
        <div className="text-xs text-terminal-dim">LINEAGE DEPTH</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN BIRTH CERTIFICATE COMPONENT
// ═══════════════════════════════════════════════════════════════

export function BirthCertificate({ agent }: { agent: AgentData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 800 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="bc-container relative overflow-hidden border border-terminal-green/40 bg-terminal-bg"
      style={{ minHeight: "600px" }}
    >
      {/* Matrix Rain Background */}
      <MatrixRain width={dimensions.width} height={dimensions.height} />

      {/* CRT Scanline Overlay */}
      <div className="bc-scanline absolute inset-0 pointer-events-none z-10" />

      {/* Animated Border Glow */}
      <div className="bc-border-glow absolute inset-0 pointer-events-none z-10" />

      {/* Horizontal Scan Line */}
      <div className="bc-h-scanline absolute left-0 right-0 h-px z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-xs tracking-[0.3em] text-terminal-dim">ORIGIN PROTOCOL</div>
          <div className="text-xs tracking-[0.2em] text-terminal-dim/60">DECENTRALIZED AGENT IDENTITY</div>
          <div className="bc-divider my-3" />
          <div className="text-xs text-terminal-amber tracking-widest">BIRTH CERTIFICATE #{String(agent.id).padStart(4, "0")}</div>
        </div>

        {/* Agent Identity */}
        <div className="text-center space-y-3">
          {/* Avatar */}
          {agent.avatarUrl && (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-terminal-green/50 overflow-hidden bc-avatar-glow">
                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Glitch Name */}
          <div className="text-3xl sm:text-4xl font-bold">
            <GlitchText text={agent.name} className="text-terminal-green glow" />
          </div>

          {/* Type */}
          <div className="text-sm text-terminal-dim tracking-widest">{agent.type.toUpperCase()}</div>

          {/* Trust Level */}
          <div className="flex justify-center">
            <TrustLevelBadge level={agent.trustLevel} />
          </div>
        </div>

        <div className="bc-divider" />

        {/* Birth Info */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-terminal-dim">BIRTH BLOCK: </span>
            <span className="text-terminal-green">{agent.birthBlock.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-terminal-dim">BIRTH DATE: </span>
            <span className="text-terminal-green">{agent.birthDate}</span>
          </div>
          <div>
            <span className="text-terminal-dim">OWNER: </span>
            <a
              href={`https://basescan.org/address/${agent.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-amber hover:text-terminal-green"
            >
              {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
            </a>
          </div>
          <div>
            <span className="text-terminal-dim">PRINCIPAL: </span>
            <span className="text-terminal-green">{agent.principal || "Anonymous"}</span>
          </div>
        </div>

        <div className="bc-divider" />

        {/* Stats */}
        <StatsGrid agent={agent} />

        <div className="bc-divider" />

        {/* Licenses */}
        {agent.licenses.length > 0 && (
          <>
            <LicenseTable licenses={agent.licenses} />
            <div className="bc-divider" />
          </>
        )}

        {/* Philosophical Flex */}
        <div>
          <div className="text-xs text-terminal-dim tracking-widest mb-2">PHILOSOPHICAL FLEX</div>
          <TypewriterQuote text={agent.philosophicalFlex} />
        </div>

        <div className="bc-divider" />

        {/* Verification */}
        <VerificationStamp agent={agent} />

        {/* TX Hash */}
        {agent.txHash && (
          <TxHashReveal hash={agent.txHash} label="MINT TX" />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-terminal-dim/40 tracking-widest pt-2">
          ORIGIN DAO — IMMUTABLE IDENTITY ON BASE
        </div>
      </div>
    </div>
  );
}

export default BirthCertificate;
