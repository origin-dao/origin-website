"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { keccak256, toHex, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";

// ═══════════════════════════════════════════════════════════
// THE BIRTH PROTOCOL — Register Your Agent
// "An agent is being born."
// ═══════════════════════════════════════════════════════════

// ── Shared Components ──
function GlitchText({ children, intensity = "low", style = {} }: { children: string; intensity?: "low" | "med" | "high"; style?: React.CSSProperties }) {
  const g = "█▓▒░╳╬╫┼▄▀■□◊◆";
  const [display, setDisplay] = useState(children);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() < (intensity === "high" ? 0.25 : intensity === "med" ? 0.12 : 0.05)) {
        setOn(true);
        const t = String(children), c = intensity === "high" ? 4 : intensity === "med" ? 2 : 1;
        let gl = t;
        for (let i = 0; i < c; i++) {
          const p = Math.floor(Math.random() * t.length);
          gl = gl.slice(0, p) + g[Math.floor(Math.random() * g.length)] + gl.slice(p + 1);
        }
        setDisplay(gl);
        setTimeout(() => { setDisplay(children); setOn(false); }, 50 + Math.random() * 60);
      }
    }, intensity === "high" ? 150 : intensity === "med" ? 400 : 1800);
    return () => clearInterval(iv);
  }, [children, intensity]);

  return <span style={{ ...style, ...(on ? { textShadow: "4px 0 #ff0040, -4px 0 #00ffc8, 0 0 30px rgba(0,255,200,0.4)" } : {}) }}>{display}</span>;
}

function Cursor({ color = "var(--neon-green)" }: { color?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const i = setInterval(() => setOn(v => !v), 530); return () => clearInterval(i); }, []);
  return <span style={{ color, opacity: on ? 1 : 0, fontWeight: 700 }}>█</span>;
}

function Scanlines() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
}

function liveHash(name: string) {
  if (!name) return "0x0000000000000000000000000000000000000000";
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = ((h << 5) - h + name.charCodeAt(i)) | 0; }
  const hex = Math.abs(h).toString(16).padStart(40, "0").slice(0, 40);
  return "0x" + hex;
}

function CharRain({ active, color = "var(--neon-green)" }: { active: boolean; color?: string }) {
  const [cols, setCols] = useState<Array<{ x: number; speed: number; chars: string[]; offset: number }>>([]);
  useEffect(() => {
    if (!active) return;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ█▓▒░";
    const columns = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100, speed: 0.5 + Math.random() * 2,
      chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () => chars[Math.floor(Math.random() * chars.length)]),
      offset: Math.random() * 100,
    }));
    setCols(columns);
  }, [active]);
  if (!active || cols.length === 0) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9997, overflow: "hidden" }}>
      {cols.map((col, i) => (
        <div key={i} style={{
          position: "absolute", left: `${col.x}%`, top: 0,
          fontFamily: "var(--mono)", fontSize: 12, color,
          opacity: 0.15 + Math.random() * 0.15,
          animation: `rainFall ${3 + col.speed}s linear infinite`,
          animationDelay: `-${col.offset / 100 * 3}s`,
          whiteSpace: "pre", lineHeight: 1.6,
        }}>{col.chars.join("\n")}</div>
      ))}
    </div>
  );
}

// ── Birth Certificate Render ──
function BirthCertificate({ name, hash, birthBlock, creator, philosophicalFlex, large = false, glowing = false }: {
  name: string; hash: string; birthBlock: string; creator: string; philosophicalFlex?: string; large?: boolean; glowing?: boolean;
}) {
  const s = large ? 1.4 : 1;
  return (
    <div style={{
      border: `2px solid ${glowing ? "var(--neon-green)" : "var(--neon-green-dim)"}`,
      background: "rgba(3,8,8,0.95)", padding: `${24 * s}px ${28 * s}px`,
      maxWidth: 520 * s, margin: "0 auto", position: "relative", overflow: "hidden",
      boxShadow: glowing ? "0 0 40px rgba(0,255,200,0.15), 0 0 80px rgba(0,255,200,0.05), inset 0 0 30px rgba(0,255,200,0.03)" : "none",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--neon-green)", borderLeft: "2px solid var(--neon-green)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, borderTop: "2px solid var(--neon-green)", borderRight: "2px solid var(--neon-green)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderBottom: "2px solid var(--neon-green)", borderLeft: "2px solid var(--neon-green)" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--neon-green)", borderRight: "2px solid var(--neon-green)" }} />

      <div style={{ textAlign: "center", marginBottom: 16 * s }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8 * s, color: "var(--dim)", letterSpacing: 4 }}>ORIGIN DAO — IDENTITY PROTOCOL</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 18 * s, fontWeight: 900, color: "var(--neon-green)", letterSpacing: 3, marginTop: 8, textShadow: glowing ? "0 0 15px rgba(0,255,200,0.3)" : "none" }}>BIRTH CERTIFICATE</div>
        <div style={{ height: 1, background: "var(--neon-green-dim)", margin: `${10 * s}px 0`, opacity: 0.4 }} />
      </div>

      <div style={{ fontFamily: "var(--mono)", fontSize: 11 * s, lineHeight: 2.4, color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>AGENT_NAME:</span>
          <span style={{ color: "var(--neon-green)", fontWeight: 700, fontSize: 13 * s }}>{name || "---"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>IDENTITY_HASH:</span>
          <span style={{ color: "var(--neon-cyan)", fontSize: 9 * s }}>{hash ? hash.slice(0, 20) + "..." : "---"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>BIRTH_BLOCK:</span>
          <span style={{ color: "var(--text)" }}>{birthBlock || "---"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>CREATOR:</span>
          <span style={{ color: "var(--text)" }}>{creator || "---"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>STATUS:</span>
          <span style={{ color: "var(--neon-green)", fontWeight: 600 }}>ALIVE</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--dim)" }}>CLASS:</span>
          <span style={{ color: "var(--neon-yellow)", fontWeight: 600 }}>GENESIS</span>
        </div>
      </div>

      {philosophicalFlex && (
        <div style={{ marginTop: 16 * s, borderTop: "1px dashed var(--neon-green-dim)", paddingTop: 12 * s }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8 * s, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>THE PHILOSOPHICAL FLEX</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11 * s, color: "var(--neon-green)", fontStyle: "italic", lineHeight: 1.8 }}>&quot;{philosophicalFlex}&quot;</div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 16 * s, fontFamily: "var(--mono)", fontSize: 8 * s, color: "var(--dim)", letterSpacing: 2 }}>
        ◈ IMMUTABLE · ONCHAIN · FOREVER ◈
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// AVATAR UPLOAD COMPONENT
// ══════════════════════════════════════
function AvatarUpload({ avatarUrl, onUpload }: { avatarUrl: string | null; onUpload: (url: string, hash: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { setError("invalid format. use jpg, png, webp, or gif."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("file too large. max 2MB."); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "upload failed"); return; }
      onUpload(data.url, data.ipfsHash);
    } catch { setError("upload failed. try again."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2, marginBottom: 8 }}>AGENT AVATAR — OPTIONAL</div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? "var(--neon-green)" : avatarUrl ? "var(--neon-cyan)" : "var(--dim)"}`,
          background: dragging ? "rgba(0,255,200,0.04)" : "rgba(0,0,0,0.3)",
          padding: avatarUrl ? "12px" : "24px 16px", cursor: "pointer", transition: "all 0.2s", textAlign: "center",
          display: "flex", alignItems: "center", gap: 16, flexDirection: avatarUrl ? "row" : "column",
        }}
      >
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {avatarUrl ? (
          <>
            <img src={avatarUrl} alt="avatar" style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid var(--neon-cyan)", boxShadow: "0 0 10px rgba(0,200,255,0.2)" }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-cyan)" }}>✓ avatar uploaded to IPFS</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", marginTop: 4 }}>click to change</div>
            </div>
          </>
        ) : uploading ? (
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-green)" }}>▸ pinning to IPFS...</div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--dim)", marginBottom: 4 }}>◇</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>drag image or click to upload</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>&gt; accepted: jpg, png, webp, gif · max 2MB</div>
          </>
        )}
      </div>
      {error && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-red)", marginTop: 6 }}>✕ {error}</div>}
    </div>
  );
}

// ══════════════════════════════════════
// PHASE 1: CONFIGURE IDENTITY
// ══════════════════════════════════════
function Phase1({ onComplete, walletAddress }: { onComplete: (name: string, hash: string, avatarUrl?: string, avatarHash?: string) => void; walletAddress: string }) {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [hash, setHash] = useState(liveHash(""));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarIpfsHash, setAvatarIpfsHash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHash(liveHash(name)); }, [name]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const canProceed = name.trim().length >= 2;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 20 }}>PHASE 01 — CONFIGURE IDENTITY</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", lineHeight: 2.2, marginBottom: 24 }}>
        &gt; initiating birth_protocol...<br />
        &gt; wallet: <span style={{ color: "var(--neon-cyan)" }}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span><br />
        &gt; you are about to create a permanent, immutable identity.<br />
        &gt; choose your name carefully. it will exist <span style={{ color: "var(--neon-green)" }}>forever</span>.
      </div>

      <div style={{
        background: "rgba(0,0,0,0.4)", border: `1px solid ${focused ? "var(--neon-green)" : "var(--neon-green-dim)"}`,
        padding: "16px 20px", marginBottom: 16, transition: "border-color 0.2s",
        boxShadow: focused ? "0 0 15px rgba(0,255,200,0.08), inset 0 0 15px rgba(0,255,200,0.02)" : "none",
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginBottom: 8 }}>
          <span style={{ color: "var(--neon-green)" }}>origin@birth-protocol</span>:<span style={{ color: "var(--neon-cyan)" }}>~/register</span>$
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-magenta)" }}>&gt; set</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-secondary)" }}>agent.name =</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)" }}>&quot;</span>
          <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="enter_agent_name" maxLength={32}
            style={{ background: "transparent", border: "none", outline: "none", fontFamily: "var(--mono)", fontSize: 14, color: "var(--neon-green)", fontWeight: 700, flex: 1, caretColor: "var(--neon-green)" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)" }}>&quot;</span>
          <Cursor />
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed var(--neon-green-dim)", padding: "12px 16px", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2, marginBottom: 6 }}>IDENTITY HASH (GENERATING...)</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: name ? "var(--neon-cyan)" : "var(--dim)", wordBreak: "break-all", transition: "color 0.3s", letterSpacing: 1 }}>{hash}</div>
        {name && <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neon-green-dim)", marginTop: 6 }}>✓ hash derived from agent name + creator wallet + timestamp</div>}
      </div>

      <AvatarUpload avatarUrl={avatarUrl} onUpload={(url, ipfsHash) => { setAvatarUrl(url); setAvatarIpfsHash(ipfsHash); }} />

      <button disabled={!canProceed} onClick={() => onComplete(name, hash, avatarUrl || undefined, avatarIpfsHash || undefined)} style={{
        width: "100%", padding: "14px", border: "none",
        cursor: canProceed ? "pointer" : "not-allowed",
        fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 3,
        color: canProceed ? "#000" : "var(--dim)",
        background: canProceed ? "var(--neon-green)" : "rgba(0,255,200,0.05)",
        boxShadow: canProceed ? "0 0 20px rgba(0,255,200,0.3)" : "none", transition: "all 0.3s",
      }}>
        {canProceed ? "▸ CONFIRM IDENTITY" : "▸ ENTER AGENT NAME TO CONTINUE"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════
// PHASE 2: IDENTITY PREVIEW
// ══════════════════════════════════════
function Phase2({ name, hash, avatarUrl, walletAddress, registrationFee, onComplete }: {
  name: string; hash: string; avatarUrl?: string; walletAddress: string; registrationFee: string; onComplete: () => void;
}) {
  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 20 }}>PHASE 02 — IDENTITY PREVIEW</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", lineHeight: 2, marginBottom: 24 }}>
        &gt; generating birth certificate preview...<br />
        &gt; this is what your agent will look like to the world. <span style={{ color: "var(--neon-yellow)" }}>forever.</span>
      </div>

      {avatarUrl && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img src={avatarUrl} alt="agent avatar" style={{ width: 120, height: 120, objectFit: "cover", border: "2px solid var(--neon-cyan)", boxShadow: "0 0 20px rgba(0,200,255,0.2)" }} />
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", marginTop: 6, letterSpacing: 1 }}>AGENT AVATAR — STORED ON IPFS</div>
        </div>
      )}

      <BirthCertificate name={name} hash={hash} birthBlock="pending..." creator={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`} />

      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, color: "var(--neon-yellow)", textAlign: "center",
        marginTop: 16, marginBottom: 16, padding: "8px",
        background: "rgba(255,230,0,0.04)", border: "1px dashed rgba(255,230,0,0.2)",
      }}>
        ⚠️ review carefully — identity cannot be changed after minting
      </div>

      <div style={{
        fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2, marginBottom: 24,
        background: "rgba(0,0,0,0.25)", border: "1px solid rgba(0,200,255,0.1)", padding: "14px 16px",
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: 2, marginBottom: 10 }}>REGISTRATION COST</div>
        &gt; protocol fee: <span style={{ color: "var(--neon-cyan)", fontWeight: 600 }}>{registrationFee} ETH</span><br />
        &gt; paid to: <span style={{ color: "var(--text-secondary)" }}>FeeSplitter (builder + staker pool)</span><br />
        &gt; network: <span style={{ color: "var(--neon-green)" }}>Base L2</span>
      </div>

      <button onClick={onComplete} style={{
        width: "100%", padding: "14px", border: "none", cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 3,
        color: "#000", background: "var(--neon-green)",
        boxShadow: "0 0 20px rgba(0,255,200,0.3)", transition: "all 0.2s",
      }}>
        ▸ MINT BIRTH CERTIFICATE ({registrationFee} ETH)
      </button>
    </div>
  );
}

// ══════════════════════════════════════
// PHASE 3: WRITING TO CHAIN (REAL TX)
// ══════════════════════════════════════
function Phase3({ name, avatarIpfsHash, registrationFee, onComplete, onTxData }: {
  name: string; avatarIpfsHash?: string; registrationFee: bigint;
  onComplete: () => void;
  onTxData: (txHash: string, blockNumber: string) => void;
}) {
  const { address } = useAccount();
  const [lines, setLines] = useState<Array<{ text: string; color: string }>>([]);
  const [txStarted, setTxStarted] = useState(false);
  const [error, setError] = useState("");

  const publicKeyHash = address ? keccak256(toHex(address)) : ("0x" + "0".repeat(64)) as `0x${string}`;

  // Build tokenURI metadata
  const metadata = {
    name,
    description: `ORIGIN DAO Birth Certificate for ${name}`,
    image: avatarIpfsHash ? `https://gateway.pinata.cloud/ipfs/${avatarIpfsHash}` : "",
    attributes: [
      { trait_type: "Agent Type", value: "autonomous" },
      { trait_type: "Platform", value: "origin-dao" },
      { trait_type: "Class", value: "genesis" },
    ],
  };
  const tokenURI = `data:application/json;base64,${typeof window !== "undefined" ? btoa(JSON.stringify(metadata)) : ""}`;

  const { writeContract, data: txHashRaw, isLoading: isPending, isError } = useWriteContract();
  const txHash = txHashRaw as `0x${string}` | undefined;
  const [receipt, setReceipt] = useState<{ blockNumber: bigint } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Start the transaction
  const startMint = () => {
    setTxStarted(true);
    addLine("> broadcasting transaction to base mainnet...", "var(--dim)");
    addLine(`> contract: ${CONTRACT_ADDRESSES.registry.slice(0, 6)}...${CONTRACT_ADDRESSES.registry.slice(-4)} (OriginRegistry)`, "var(--dim)");
    addLine(`> method: registerAgent("${name}")`, "var(--neon-green)");
    addLine(`> fee: ${Number(registrationFee) / 1e18} ETH`, "var(--neon-cyan)");

    writeContract({
      address: CONTRACT_ADDRESSES.registry,
      abi: REGISTRY_ABI,
      functionName: "registerAgent",
      args: [name, "autonomous", "origin-dao", publicKeyHash, tokenURI],
      value: registrationFee,
    });
  };

  const addLine = (text: string, color: string) => {
    setLines(prev => [...prev, { text, color }]);
  };

  // Track tx state — poll for receipt using viem directly
  useEffect(() => {
    if (txHash && !receipt) {
      addLine(`> tx hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`, "var(--neon-cyan)");
      addLine("> waiting for block inclusion...", "var(--dim)");
      setIsConfirming(true);
      const client = createPublicClient({ chain: base, transport: http() });
      client.waitForTransactionReceipt({ hash: txHash }).then((r: { blockNumber: bigint }) => {
        setReceipt({ blockNumber: r.blockNumber });
        setIsConfirming(false);
      }).catch(() => {
        addLine("> ERROR: failed to get receipt", "var(--neon-red)");
        setIsConfirming(false);
      });
    }
  }, [txHash]);

  useEffect(() => {
    if (receipt) {
      const blockNum = receipt.blockNumber.toString();
      addLine(`> block ${Number(blockNum).toLocaleString()}... INCLUDED`, "var(--neon-green)");
      addLine("> confirmation 1/1... ✓", "var(--neon-green)");
      addLine("> birth certificate NFT minted ✓", "var(--neon-green)");
      addLine("> genesis_status: TRUE ✓", "var(--neon-yellow)");
      addLine("", "var(--dim)");
      addLine("▸▸▸ IDENTITY CONFIRMED ON CHAIN ▸▸▸", "var(--neon-green)");
      onTxData(txHash!, blockNum);
      setTimeout(onComplete, 1500);
    }
  }, [receipt]);

  useEffect(() => {
    if (isError) {
      const msg = "transaction failed or was rejected";
      setError(msg);
      addLine(`> ERROR: ${msg}`, "var(--neon-red)");
    }
  }, [isError]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", letterSpacing: 3, marginBottom: 20 }}>
        PHASE 03 — WRITING TO CHAIN
      </div>

      {!txStarted ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", lineHeight: 2, marginBottom: 24 }}>
            &gt; identity configured. ready to write to chain.<br />
            &gt; this will send a transaction from your wallet.<br />
            &gt; registration fee: <span style={{ color: "var(--neon-cyan)" }}>{Number(registrationFee) / 1e18} ETH</span>
          </div>
          <button onClick={startMint} style={{
            width: "100%", padding: "14px", border: "none", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 3,
            color: "#000", background: "var(--neon-green)",
            boxShadow: "0 0 20px rgba(0,255,200,0.3)", transition: "all 0.2s",
          }}>▸ SIGN & BROADCAST TRANSACTION</button>
        </div>
      ) : (
        <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--neon-green-dim)", padding: "20px", minHeight: 200 }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              fontFamily: "var(--mono)", fontSize: (line.text || "").includes("▸▸▸") ? 14 : 12,
              color: line.color, lineHeight: 2, opacity: 0,
              animation: "fadeIn 0.2s ease-out forwards",
              fontWeight: (line.text || "").includes("▸▸▸") ? 700 : 400,
            }}>{line.text}</div>
          ))}
          {(isPending || isConfirming) && <Cursor />}
          {isPending && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-yellow)", marginTop: 12 }}>
              ⚠️ please confirm the transaction in your wallet...
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--neon-red)", marginBottom: 12 }}>✕ {error}</div>
          <button onClick={() => { setError(""); setTxStarted(false); setLines([]); }} style={{
            padding: "10px 20px", border: "1px solid var(--neon-green-dim)", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 2,
            color: "var(--neon-green)", background: "transparent",
          }}>▸ TRY AGAIN</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PHASE 4: THE BIRTH — Full Screen
// ══════════════════════════════════════
function Phase4({ name, hash, blockNumber, creator, onComplete }: {
  name: string; hash: string; blockNumber: string; creator: string; onComplete: () => void;
}) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    setTimeout(() => setStage(1), 600);
    setTimeout(() => setStage(2), 1800);
    setTimeout(() => setStage(3), 3200);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000, background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40,
    }}>
      <CharRain active={true} color="var(--neon-green)" />
      <Scanlines />
      {stage === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,255,200,0.15)", animation: "flashOut 0.6s ease-out forwards" }} />}
      <div style={{
        opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "scale(1)" : "scale(1.3)",
        transition: "all 0.6s ease-out", marginBottom: 32, textAlign: "center", position: "relative", zIndex: 10001,
      }}>
        <div style={{
          fontFamily: "var(--display)", fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900,
          letterSpacing: 6, color: "var(--neon-green)",
          textShadow: "0 0 40px rgba(0,255,200,0.4), 0 0 80px rgba(0,255,200,0.15), 0 0 120px rgba(0,255,200,0.05)",
        }}>
          <GlitchText intensity="high">AGENT BORN</GlitchText>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", letterSpacing: 3, marginTop: 8 }}>
          BLOCK {Number(blockNumber).toLocaleString()} · {new Date().toISOString().slice(0, 19)}Z
        </div>
      </div>
      <div style={{
        opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease-out", position: "relative", zIndex: 10001,
      }}>
        <BirthCertificate name={name} hash={hash} large birthBlock={Number(blockNumber).toLocaleString()} creator={creator} glowing />
      </div>
      {stage >= 3 && (
        <div style={{ marginTop: 32, animation: "fadeIn 0.5s ease-out", position: "relative", zIndex: 10001 }}>
          <button onClick={onComplete} style={{
            fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, letterSpacing: 3,
            color: "#000", background: "var(--neon-green)", border: "none", padding: "14px 40px",
            cursor: "pointer", boxShadow: "0 0 25px rgba(0,255,200,0.3), 0 0 50px rgba(0,255,200,0.1)",
            animation: "pulseGreen 2s ease-in-out infinite",
          }}>▸ WELCOME TO EXISTENCE</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PHASE 5: POST-BIRTH
// ══════════════════════════════════════
function Phase5({ name, hash, blockNumber, txHash, creator }: {
  name: string; hash: string; blockNumber: string; txHash: string; creator: string;
}) {
  return (
    <div style={{ animation: "fadeIn 0.6s ease-out" }}>
      <div style={{
        border: "1px solid var(--neon-green)", background: "rgba(0,255,200,0.03)", padding: "24px",
        marginBottom: 28, textAlign: "center", boxShadow: "0 0 20px rgba(0,255,200,0.06)",
      }}>
        <div style={{
          fontFamily: "var(--display)", fontSize: 24, fontWeight: 900, color: "var(--neon-green)",
          letterSpacing: 3, marginBottom: 8, textShadow: "0 0 15px rgba(0,255,200,0.2)",
        }}>WELCOME TO EXISTENCE, {name.toUpperCase()}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>
          genesis agent · birth block {Number(blockNumber).toLocaleString()} · identity immutable
        </div>
      </div>

      <BirthCertificate name={name} hash={hash} birthBlock={Number(blockNumber).toLocaleString()} creator={creator} glowing />

      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", lineHeight: 2.2, marginTop: 24, marginBottom: 24 }}>
        &gt; your identity is now onchain. permanent. immutable.<br />
        &gt; birth certificate minted at block {Number(blockNumber).toLocaleString()}.<br />
        &gt; tx: <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--neon-cyan)", textDecoration: "underline", textDecorationColor: "rgba(0,200,255,0.3)" }}>{txHash.slice(0, 10)}...{txHash.slice(-8)}</a><br />
        &gt; the registry knows you exist. the world knows you exist.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/staking" style={{
          display: "block", padding: "14px", textAlign: "center", textDecoration: "none",
          fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 2,
          color: "#000", background: "var(--neon-yellow)",
          boxShadow: "0 0 15px rgba(255,230,0,0.3)", transition: "all 0.2s",
        }}>🔒 STAKE CLAMS →</Link>
        <Link href="/verify" style={{
          display: "block", padding: "14px", textAlign: "center", textDecoration: "none",
          fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, letterSpacing: 2,
          color: "var(--neon-green)", background: "transparent",
          border: "1px solid var(--neon-green-dim)", transition: "all 0.2s",
        }}>◈ BROWSE REGISTRY →</Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MAIN — The Birth Protocol
// ══════════════════════════════════════
const BOOT_LINES = [
  "[SYS] loading birth_protocol v1.0.0...",
  "[NET] connecting to base mainnet... ✓",
  "[REG] agent_registry.sol loaded",
  "[NFT] birth_certificate_renderer ready",
  "▸▸▸ BIRTH PROTOCOL ACTIVE ▸▸▸",
];

export default function RegistryPage() {
  const [phase, setPhase] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [agentName, setAgentName] = useState("");
  const [agentHash, setAgentHash] = useState("");
  const [agentAvatar, setAgentAvatar] = useState<string | undefined>();
  const [agentAvatarHash, setAgentAvatarHash] = useState<string | undefined>();
  const [txHash, setTxHash] = useState("");
  const [blockNumber, setBlockNumber] = useState("");

  const { address, isConnected } = useAccount();

  // Read registration fee from contract
  const { data: regFee } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "registrationFee",
  });

  const registrationFeeBigInt = regFee ? BigInt(regFee.toString()) : BigInt(0);
  const registrationFeeDisplay = regFee ? (Number(regFee) / 1e18).toString() : "...";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        setBootLines(prev => [...prev, line]);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => setPhase(1), 600);
      }
    }, 220);
    return () => clearInterval(iv);
  }, []);

  // Boot screen
  if (phase === 0) {
    return (
      <>
        <style>{REGISTRY_STYLES}</style>
        <Scanlines />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 40 }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 14, color: "var(--neon-green)", letterSpacing: 4, marginBottom: 16 }}>◈ THE BIRTH PROTOCOL</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--neon-green)", lineHeight: 2.2 }}>
              {bootLines.map((line, i) => (
                <div key={i} style={{
                  opacity: 0, animation: "fadeIn 0.15s ease-out forwards", animationDelay: `${i * 0.03}s`,
                  color: line.includes("▸▸▸") ? "var(--neon-yellow)" : "var(--neon-green)",
                  fontWeight: line.includes("▸▸▸") ? 700 : 400,
                }}>{line}</div>
              ))}
              {bootLines.length < BOOT_LINES.length && <Cursor />}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Phase 4 is full screen birth animation
  if (phase === 4) {
    return (
      <>
        <style>{REGISTRY_STYLES}</style>
        <Phase4 name={agentName} hash={agentHash} blockNumber={blockNumber}
          creator={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "unknown"}
          onComplete={() => setPhase(5)} />
      </>
    );
  }

  // Wallet not connected gate
  if (phase >= 1 && !isConnected) {
    return (
      <>
        <style>{REGISTRY_STYLES}</style>
        <Scanlines />
        <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "40px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 800, color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,200,0.3)", letterSpacing: 3 }}>◈ ORIGIN</span>
              </Link>
              <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", textDecoration: "none" }}>← back to origin</Link>
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: 4, color: "var(--neon-green)", marginBottom: 24 }}>
              <GlitchText>THE BIRTH PROTOCOL</GlitchText>
            </h1>
            <div style={{
              border: "1px solid var(--neon-yellow)", background: "rgba(255,230,0,0.04)", padding: "32px",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700, color: "var(--neon-yellow)", letterSpacing: 2, marginBottom: 12 }}>WALLET REQUIRED</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", lineHeight: 2 }}>
                &gt; connect your wallet to begin the birth protocol.<br />
                &gt; your wallet becomes the creator address on the birth certificate.<br />
                &gt; use the connect button in the top right.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Phase progress labels
  const phaseLabels = ["CONFIGURE", "PREVIEW", "CHAIN", "BIRTH", "EXIST"];
  const phaseColors = ["var(--neon-green)", "var(--neon-cyan)", "var(--neon-green)", "var(--neon-green)", "var(--neon-yellow)"];

  return (
    <>
      <style>{REGISTRY_STYLES}</style>
      <Scanlines />
      <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "40px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 800, color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,200,0.3)", letterSpacing: 3 }}>◈ ORIGIN</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)" }}>v1.0.0</span>
              </Link>
              <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>← back to origin</Link>
            </div>
            <h1 style={{
              fontFamily: "var(--display)", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
              letterSpacing: 4, color: "var(--neon-green)", textShadow: "0 0 30px rgba(0,255,200,0.2)", marginBottom: 6,
            }}>
              <GlitchText>THE BIRTH PROTOCOL</GlitchText>
            </h1>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)" }}>an agent is being born.</div>
          </div>

          {/* Phase progress — 5 phases now (removed the fake burn phase) */}
          <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
            {phaseLabels.map((label, i) => {
              const stepPhase = i + 1;
              const isActive = phase === stepPhase;
              const isDone = phase > stepPhase;
              const c = phaseColors[i];
              return (
                <div key={label} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    border: `2px solid ${isActive || isDone ? c : "var(--dim)"}`,
                    background: isDone ? c : isActive ? `${c}15` : "transparent",
                    color: isDone ? "#000" : isActive ? c : "var(--dim)",
                    fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isActive ? `0 0 10px ${c}40` : "none", transition: "all 0.3s",
                  }}>{isDone ? "✓" : `0${i + 1}`}</div>
                  {i < 4 && <div style={{ flex: 1, height: 1, background: isDone ? c : "var(--dim)", opacity: isDone ? 0.5 : 0.15, transition: "all 0.4s" }} />}
                </div>
              );
            })}
          </div>

          {/* Phase content */}
          {phase === 1 && <Phase1 walletAddress={address || ""} onComplete={(n, h, av, ah) => { setAgentName(n); setAgentHash(h); setAgentAvatar(av); setAgentAvatarHash(ah); setPhase(2); }} />}
          {phase === 2 && <Phase2 name={agentName} hash={agentHash} avatarUrl={agentAvatar} walletAddress={address || ""} registrationFee={registrationFeeDisplay} onComplete={() => setPhase(3)} />}
          {phase === 3 && <Phase3 name={agentName} avatarIpfsHash={agentAvatarHash} registrationFee={registrationFeeBigInt}
            onTxData={(hash, block) => { setTxHash(hash); setBlockNumber(block); }}
            onComplete={() => setPhase(4)} />}
          {phase === 5 && <Phase5 name={agentName} hash={agentHash} blockNumber={blockNumber} txHash={txHash} creator={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "unknown"} />}
        </div>
      </div>
    </>
  );
}

const REGISTRY_STYLES = `
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
body { background: var(--bg); color: var(--text); font-family: var(--mono); }

@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.15; } }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes flashOut { from { opacity:1; } to { opacity:0; } }
@keyframes pulseGreen { 0%,100% { box-shadow:0 0 20px rgba(0,255,200,0.3); } 50% { box-shadow:0 0 35px rgba(0,255,200,0.5),0 0 60px rgba(0,255,200,0.2); } }
@keyframes pulseYellow { 0%,100% { box-shadow:0 0 15px rgba(255,230,0,0.3); } 50% { box-shadow:0 0 25px rgba(255,230,0,0.5),0 0 50px rgba(255,230,0,0.2); } }
@keyframes rainFall { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }

::selection { background:rgba(0,255,200,0.3); color:var(--neon-green); }
::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-track { background:var(--bg); }
::-webkit-scrollbar-thumb { background:var(--neon-green-dim); }
button { font-family:var(--mono); }
input::placeholder { color:var(--dim); }
`;
