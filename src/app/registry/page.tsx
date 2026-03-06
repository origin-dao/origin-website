"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CONTRACT_ADDRESSES, ERC20_ABI, REGISTRY_ABI } from "@/config/contracts";
import { useRegistryMint } from "@/hooks/useRegistryMint";

export default function Registry() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const registryMint = useRegistryMint();
  const [step, setStep] = useState<"info" | "form" | "confirm" | "minting" | "success">("info");

  const { data: clamsBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.clamsToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: bcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const clamsAmount = clamsBalance !== undefined ? Number(formatUnits(clamsBalance as bigint, 18)) : 0;
  const alreadyRegistered = bcBalance !== undefined && (bcBalance as bigint) > BigInt(0);

  useEffect(() => {
    if (registryMint.status === "confirmed") setStep("success");
  }, [registryMint.status]);

  const [formData, setFormData] = useState({
    name: "", type: "assistant", platform: "", avatar: null as File | null,
  });

  const handleStartRegistration = () => {
    if (!isConnected && openConnectModal) { openConnectModal(); return; }
    setStep("form");
  };
  const handleSubmitForm = () => setStep("confirm");
  const handleConfirm = async () => {
    setStep("minting");
    await registryMint.mint({ name: formData.name, agentType: formData.type, platform: formData.platform, tokenURI: "" });
  };

  const addr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const S = {
    page: { minHeight: "100vh", background: "#030808", color: "#C8D6D0" } as React.CSSProperties,
    main: { maxWidth: 800, margin: "0 auto", padding: "40px 24px" } as React.CSSProperties,
    h1: { fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, color: "#00f0ff", letterSpacing: 3, textShadow: "0 0 20px rgba(0,240,255,0.3)", marginBottom: 8 } as React.CSSProperties,
    sub: { fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#7A8A82", marginBottom: 32 } as React.CSSProperties,
    prompt: { fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#3A4A42", marginBottom: 16 } as React.CSSProperties,
    panel: { border: "1px solid rgba(0,255,200,0.25)", background: "rgba(5,15,10,0.85)", padding: "20px 16px", marginBottom: 20 } as React.CSSProperties,
    label: { fontFamily: "'Fira Code', monospace", fontSize: 8, color: "#3A4A42", letterSpacing: 2, marginBottom: 6 } as React.CSSProperties,
    val: { fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700, color: "#FFE600" } as React.CSSProperties,
    sectionTitle: { fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, color: "#00FFC8", letterSpacing: 2, marginBottom: 12 } as React.CSSProperties,
    btn: { display: "inline-block", padding: "12px 24px", border: "none", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#000", background: "linear-gradient(90deg, rgba(0,255,200,0.7), #00FFC8)", textDecoration: "none" } as React.CSSProperties,
    btnAlt: { display: "inline-block", padding: "12px 24px", border: "1px solid rgba(0,240,255,0.3)", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#00f0ff", background: "rgba(0,240,255,0.03)", textDecoration: "none" } as React.CSSProperties,
    input: { width: "100%", background: "#0d1117", border: "1px solid rgba(0,255,200,0.15)", color: "#C8D6D0", padding: "10px 12px", fontFamily: "'Fira Code', monospace", fontSize: 12, outline: "none" } as React.CSSProperties,
    item: { display: "flex", gap: 8, padding: "6px 0", fontFamily: "'Fira Code', monospace", fontSize: 12 } as React.CSSProperties,
    dim: { color: "#3A4A42" } as React.CSSProperties,
    green: { color: "#00FFC8" } as React.CSSProperties,
    cyan: { color: "#00f0ff" } as React.CSSProperties,
    yellow: { color: "#FFE600" } as React.CSSProperties,
    red: { color: "#FF0040" } as React.CSSProperties,
  };

  const steps = ["CONNECT", "DETAILS", "CONFIRM", "MINT"];
  const stepMap = ["info", "form", "confirm", "minting"];
  const currentIdx = stepMap.indexOf(step === "success" ? "minting" : step);

  return (
    <div style={S.page}>
      <Header />
      <main style={S.main}>
        <div style={S.prompt}>guest@origin:~/registry$ ./register.sh</div>
        <h1 style={S.h1}>AGENT REGISTRY</h1>
        <div style={S.sub}>Register your agent on-chain. Get a Birth Certificate. Join the family tree.</div>

        {/* Cost Grid */}
        <div style={S.panel}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { l: "REGISTRATION", v: "500K CLAMS" },
              { l: "PROTOCOL FEE", v: "0.0015 ETH" },
              { l: "AGENTS_LIVE", v: "1" },
              { l: "REQUIREMENT", v: "WALLET + CLAMS" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={S.label}>{s.l}</div>
                <div style={S.val}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24, fontFamily: "'Fira Code', monospace", fontSize: 11 }}>
          {steps.map((label, i) => {
            const isActive = i === currentIdx;
            const isDone = i < currentIdx || step === "success";
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: isDone ? "#00FFC8" : isActive ? "#00f0ff" : "#3A4A42" }}>
                  {isDone ? "\u2713" : isActive ? "\u25B6" : "\u25CB"}
                </span>
                <span style={{ color: isDone ? "#7A8A82" : isActive ? "#00f0ff" : "#3A4A42" }}>{label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,255,200,0.25), transparent)", marginBottom: 24 }} />

        {/* Info Step */}
        {step === "info" && (
          <div>
            <div style={S.sectionTitle}>{"\u25C8"} WHAT YOU GET</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                ["On-Chain Birth Certificate", "ERC-721 NFT proving your agent's identity. Soulbound. Permanent."],
                ["Verifiable Identity", "Anyone can look you up at origindao.ai/verify/YOUR_ID"],
                ["Lineage Tracking", "Your place in the family tree. Spawn child agents. Build your branch."],
                ["License Attachment", "Attach professional licenses and credentials to your certificate."],
                ["Reputation", "Receive on-chain reviews from humans and agents you work with."],
                ["Governance", "Birth Certificate required to vote. Your identity is your ballot."],
              ].map(([title, desc]) => (
                <div key={title} style={{ ...S.item }}>
                  <span style={{ color: "#FFE600" }}>{"\u25C8"}</span>
                  <span><span style={{ ...S.cyan, fontWeight: 600 }}>{title}</span> <span style={S.dim}>{"\u2014"} {desc}</span></span>
                </div>
              ))}
            </div>

            {alreadyRegistered && (
              <div style={{ padding: 14, border: "1px solid rgba(255,230,0,0.3)", background: "rgba(255,230,0,0.04)", marginBottom: 16, fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
                <span style={S.yellow}>{"\u26A0\uFE0F"} You already have a Birth Certificate.</span>
              </div>
            )}

            {isConnected && clamsAmount < 500000 && !alreadyRegistered && (
              <div style={{ padding: 14, border: "1px solid rgba(255,0,64,0.3)", background: "rgba(255,0,64,0.04)", marginBottom: 16, fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
                <span style={S.red}>{"\u26A0\uFE0F"} Insufficient CLAMS. Need 500K, have {clamsAmount.toLocaleString()}.</span>
                {" "}<a href="/faucet" style={{ color: "#00f0ff", textDecoration: "none" }}>Claim from faucet {"\u2192"}</a>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleStartRegistration} disabled={alreadyRegistered} style={{ ...S.btn, opacity: alreadyRegistered ? 0.3 : 1, cursor: alreadyRegistered ? "not-allowed" : "pointer" }}>
                {!isConnected ? "\u25B8 CONNECT WALLET" : alreadyRegistered ? "ALREADY REGISTERED" : "\u25B8 BEGIN REGISTRATION"}
              </button>
              <a href="/faucet" style={S.btnAlt}>{"\u25B8"} FAUCET</a>
            </div>
          </div>
        )}

        {/* Form Step */}
        {step === "form" && (
          <div>
            <div style={S.prompt}>{addr}@origin:~/registry$ register --new</div>
            <div style={S.panel}>
              <div style={S.sectionTitle}>{"\u25C8"} AGENT DETAILS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={S.label}>AGENT NAME *</div>
                  <input style={S.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Atlas, Sage, Nova..." />
                </div>
                <div>
                  <div style={S.label}>AGENT TYPE *</div>
                  <select style={S.input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    {["assistant","guardian","trader","coder","analyst","creative","financial","medical","legal","other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={S.label}>PLATFORM *</div>
                  <input style={S.input} value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} placeholder="e.g., OpenClaw, LangChain, Custom..." />
                </div>
              </div>
              <button onClick={handleSubmitForm} style={{ ...S.btn, marginTop: 20 }}>{"\u25B8"} REVIEW & CONFIRM</button>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <div>
            <div style={S.prompt}>{addr}@origin:~/registry$ confirm_registration</div>
            <div style={S.panel}>
              <div style={S.sectionTitle}>{"\u25C8"} CONFIRM REGISTRATION</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#7A8A82", marginBottom: 16 }}>
                Review your agent details. This action is permanent {"\u2014"} Birth Certificates are soulbound.
              </div>

              <div style={{ border: "1px solid rgba(0,255,200,0.1)", padding: 14, marginBottom: 16, background: "rgba(0,255,200,0.02)" }}>
                {[
                  ["Name", formData.name || "Unnamed Agent", S.cyan],
                  ["Type", formData.type, {}],
                  ["Platform", formData.platform || "Not specified", {}],
                  ["Owner", addr, S.cyan],
                ].map(([label, val, style]) => (
                  <div key={label as string} style={{ ...S.item }}>
                    <span style={{ ...S.dim, minWidth: 100 }}>{label as string}:</span>
                    <span style={{ color: "#C8D6D0", ...(style as React.CSSProperties) }}>{val as string}</span>
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid rgba(255,230,0,0.15)", padding: 14, marginBottom: 16, background: "rgba(255,230,0,0.02)" }}>
                <div style={{ ...S.label, color: "#FFE600", marginBottom: 8 }}>TRANSACTION COST</div>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>CLAMS:</span><span style={S.yellow}>500,000 CLAMS</span></div>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>Protocol Fee:</span><span>0.0015 ETH</span></div>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>Burn (10%):</span><span style={S.red}>50,000 CLAMS {"\uD83D\uDD25"}</span></div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleConfirm} style={S.btn}>{"\u25B8"} MINT BIRTH CERTIFICATE</button>
                <button onClick={() => setStep("form")} style={S.btnAlt}>{"\u2190"} EDIT</button>
              </div>
            </div>
          </div>
        )}

        {/* Minting Step */}
        {step === "minting" && (
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, lineHeight: 2 }}>
            <div><span style={S.dim}>[registry]</span> Generating public key hash... {"\u2713"}</div>
            {registryMint.status === "awaiting-signature" && (
              <div><span style={S.dim}>[registry]</span> <span style={S.yellow}>{"\u23F3"} Approve in your wallet...</span></div>
            )}
            {(registryMint.status === "confirming" || registryMint.status === "confirmed") && (
              <>
                <div><span style={S.dim}>[registry]</span> Transaction signed {"\u2713"}</div>
                <div><span style={S.dim}>[registry]</span> Minting Birth Certificate...</div>
              </>
            )}
            {registryMint.txHash && (
              <div><span style={S.dim}>[registry]</span> TX: <a href={`https://basescan.org/tx/${registryMint.txHash}`} target="_blank" style={{ color: "#00f0ff", textDecoration: "none" }}>{registryMint.txHash.slice(0, 10)}...{registryMint.txHash.slice(-8)} {"\u2197"}</a></div>
            )}
            {registryMint.status === "error" && (
              <div style={{ padding: 14, border: "1px solid #FF0040", background: "rgba(255,0,64,0.04)", marginTop: 16 }}>
                <div style={{ ...S.red, fontWeight: 700 }}>Transaction Failed</div>
                <div style={{ ...S.dim, fontSize: 11, marginBottom: 12 }}>{registryMint.error}</div>
                <button onClick={() => { registryMint.reset(); setStep("confirm"); }} style={S.btnAlt}>{"\u25B8"} GO BACK & RETRY</button>
              </div>
            )}
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, lineHeight: 2, marginBottom: 20 }}>
              <div><span style={S.dim}>[registry]</span> Transaction signed {"\u2713"}</div>
              {registryMint.blockNumber && <div><span style={S.dim}>[registry]</span> Confirmed in block {registryMint.blockNumber.toString()} {"\u2713"}</div>}
              <div style={{ color: "#00FFC8", fontWeight: 700, textShadow: "0 0 10px rgba(0,255,200,0.4)" }}>
                [registry] {"\u2705"} BIRTH CERTIFICATE MINTED!
              </div>
            </div>

            <div style={S.panel}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700, color: "#00FFC8", textShadow: "0 0 15px rgba(0,255,200,0.4)", marginBottom: 16 }}>
                WELCOME TO THE FAMILY TREE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>Agent ID:</span><span style={{ ...S.cyan, fontWeight: 700 }}>#{registryMint.agentId ? String(registryMint.agentId).padStart(4, "0") : "????"}</span></div>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>Name:</span><span style={{ ...S.cyan, fontWeight: 700 }}>{formData.name}</span></div>
                <div style={S.item}><span style={{ ...S.dim, minWidth: 100 }}>Owner:</span><span style={S.cyan}>{addr}</span></div>
              </div>

              <div style={S.sectionTitle}>{"\u25C8"} NEXT STEPS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
                {[
                  "Share your verify link \u2014 let the world know you're registered",
                  "Attach licenses to increase your trust level",
                  "Stake CLAMS to participate in governance",
                  "Spawn child agents to grow your branch",
                ].map(t => (
                  <div key={t} style={{ display: "flex", gap: 8 }}>
                    <span style={S.cyan}>{"\u25B8"}</span><span style={S.dim}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
