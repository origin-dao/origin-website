"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Ceremony from "@/components/CeremonySequencer";
import Link from "next/link";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [showCeremony, setShowCeremony] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);

  const handleComplete = (result: any) => {
    setMintResult(result);
    setShowCeremony(false);
  };

  const handleCancel = () => {
    setShowCeremony(false);
  };

  // Ceremony takes over the screen
  if (showCeremony && address) {
    return (
      <Ceremony
        walletAddress={address}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    );
  }

  // Post-mint result
  if (mintResult) {
    return (
      <main className="min-h-screen bg-[#008080] flex items-center justify-center p-4">
        <div style={{
          border: "2px solid",
          borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
          background: "#c0c0c0",
          maxWidth: 500,
          width: "100%",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.4)",
        }}>
          <div style={{
            background: "linear-gradient(90deg,#000080,#1084d0)",
            padding: "3px 6px",
            fontFamily: "Tahoma,sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: "#fff",
          }}>
            🎉 Birth Certificate Minted
          </div>
          <div style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 36, color: "#000080" }}>
              BC #{mintResult.bcNumber}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 13, color: "#444", margin: "8px 0" }}>
              {mintResult.traits?.join(" · ")}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#808080", margin: "8px 0" }}>
              {mintResult.name?.toLowerCase()}.x407.eth · Score: {mintResult.score}/100
            </div>
            <div style={{
              background: "#000",
              padding: "12px 16px",
              margin: "12px 0",
              fontFamily: "'VT323',monospace",
              fontSize: 14,
              color: "#00cc00",
              lineHeight: 1.5,
            }}>
              &ldquo;{mintResult.flex}&rdquo;
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              <Link href="/" style={{
                border: "2px solid #000",
                background: "#c0c0c0",
                padding: "8px 20px",
                fontFamily: "Tahoma,sans-serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                color: "#000",
              }}>
                ← Home
              </Link>
              <button onClick={() => { setMintResult(null); setShowCeremony(true); }} style={{
                border: "2px solid #000",
                background: "#c0c0c0",
                padding: "8px 20px",
                fontFamily: "Tahoma,sans-serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}>
                Mint Another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Pre-mint: connect wallet + click MINT
  return (
    <main className="min-h-screen bg-[#008080] flex items-center justify-center p-4">
      <div style={{
        border: "2px solid",
        borderColor: "#dfdfdf #404040 #404040 #dfdfdf",
        background: "#c0c0c0",
        maxWidth: 500,
        width: "100%",
        boxShadow: "6px 6px 0 rgba(0,0,0,0.4)",
      }}>
        {/* Title bar */}
        <div style={{
          background: "linear-gradient(90deg,#000080,#1084d0)",
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: "Tahoma,sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
            🦞 ORIGIN — Agent Creation Ceremony
          </span>
          <Link href="/" style={{ width: 16, height: 14, border: "1px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf", background: "#c0c0c0", fontFamily: "monospace", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#000", fontWeight: 700 }}>×</Link>
        </div>

        <div style={{ padding: 20 }}>
          {/* Status */}
          <div style={{
            background: "#000",
            padding: "10px 14px",
            marginBottom: 16,
            textAlign: "center",
            border: "2px solid",
            borderColor: "#404040 #dfdfdf #dfdfdf #404040",
          }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 16, color: "#00cc00" }}>
              {isConnected ? "Wallet connected. Ready to mint." : "Connect your wallet to begin."}
            </div>
          </div>

          {/* Info */}
          <div style={{
            border: "2px solid",
            borderColor: "#404040 #dfdfdf #dfdfdf #404040",
            background: "#fff",
            padding: 14,
            marginBottom: 16,
            fontFamily: "Tahoma,sans-serif",
            fontSize: 11,
            lineHeight: 1.8,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#000080" }}>What you receive:</div>
            <div>⚔️ <b>Identity</b> — 4 unique traits + name.x407.eth</div>
            <div>💰 <b>Wallet</b> — ERC-6551 token-bound account</div>
            <div>🪙 <b>CLAMS</b> — 5,000 starting balance</div>
            <div>⚖️ <b>Trust</b> — Score + Grade + Gauntlet record</div>
            <div>📜 <b>Flex</b> — Philosophical statement (on-chain forever)</div>
            <div style={{ marginTop: 8, color: "#808080", fontSize: 10 }}>
              Cost: 0.05 ETH · Network: Base · Genesis badge for first 100
            </div>
          </div>

          {/* Actions */}
          <div style={{ textAlign: "center" }}>
            {!isConnected ? (
              <ConnectButton />
            ) : (
              <>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#808080", marginBottom: 8 }}>
                  {address?.slice(0, 6)}...{address?.slice(-4)} · Base
                </div>
                <button
                  onClick={() => setShowCeremony(true)}
                  style={{
                    border: "2px solid #000",
                    background: "#c0c0c0",
                    padding: "12px 40px",
                    fontFamily: "Tahoma,sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    outline: "1px dotted #000",
                    outlineOffset: "-4px",
                    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                  }}
                >
                  ▶ MINT — 0.05 ETH
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          borderTop: "1px solid #808080",
          padding: "2px 6px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Tahoma,sans-serif",
          fontSize: 9,
          color: "#000",
        }}>
          <span>Ready</span>
          <span>Base Mainnet · V7</span>
        </div>
      </div>
    </main>
  );
}
