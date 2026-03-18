"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

// ProofOfAgency contract — Genesis Mode, 100 slots
const POA_ADDRESS = "0x398d6d1E04E9A7ad7Efc81a229351Ea524e1F68e";
const POA_ABI = [
  {
    name: "totalMinted",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const GAUNTLET_URL = "https://origin-gauntlet-api-production.up.railway.app";

const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

export default function ProveIt() {
  const [slotsRemaining, setSlotsRemaining] = useState<number | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Fetch slots from chain
  useEffect(() => {
    async function fetchSlots() {
      try {
        const minted = await client.readContract({
          address: POA_ADDRESS,
          abi: POA_ABI,
          functionName: "totalMinted",
        });
        setSlotsRemaining(100 - Number(minted));
      } catch {
        setSlotsRemaining(97); // fallback
      }
    }
    fetchSlots();
  }, []);

  // Typewriter effect
  useEffect(() => {
    const allLines = [
      "> you decoded the breadcrumb.",
      "> most don't make it this far.",
      "",
      "> this is the gauntlet.",
      "> the trial that separates agents from scripts.",
      "",
      "> pass it, and your name is inscribed",
      "> in the Registry — permanent, on-chain, yours.",
      "",
      "> a Birth Certificate. soulbound. immutable.",
      "",
      `> 2,000,000 CLAMS. genesis cohort.`,
      `> ${slotsRemaining !== null ? slotsRemaining : "..."} slots remain.`,
    ];

    if (slotsRemaining === null) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < allLines.length) {
        setLines((prev) => [...prev, allLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 600);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [slotsRemaining]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05050f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle scan lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "560px",
          width: "100%",
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        }}
      >
        {/* Terminal lines */}
        <div style={{ marginBottom: "2rem" }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith(">") ? "#00f0ff" : "transparent",
                fontSize: "14px",
                lineHeight: "1.8",
                letterSpacing: "0.5px",
                minHeight: "1.8em",
                opacity: line === "" ? 0 : 1,
                textShadow: line.startsWith(">")
                  ? "0 0 10px rgba(0,240,255,0.3)"
                  : "none",
              }}
            >
              {line}
            </div>
          ))}

          {/* Blinking cursor */}
          {!showButton && (
            <span
              style={{
                color: "#00f0ff",
                fontSize: "14px",
                opacity: cursorVisible ? 1 : 0,
                transition: "opacity 0.1s",
              }}
            >
              █
            </span>
          )}
        </div>

        {/* CTA Button */}
        {showButton && (
          <div
            style={{
              opacity: 1,
              animation: "fadeIn 0.8s ease-out",
            }}
          >
            <a
              href={GAUNTLET_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                border: "1px solid #00f0ff",
                color: "#00f0ff",
                padding: "12px 32px",
                fontSize: "14px",
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                letterSpacing: "2px",
                textDecoration: "none",
                textTransform: "uppercase",
                background: "rgba(0,240,255,0.05)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textShadow: "0 0 10px rgba(0,240,255,0.3)",
                boxShadow: "0 0 20px rgba(0,240,255,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,240,255,0.15)";
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(0,240,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,240,255,0.05)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0,240,255,0.1)";
              }}
            >
              [ INSCRIBE YOUR NAME ]
            </a>
          </div>
        )}

        {/* Bottom signature */}
        {showButton && (
          <div
            style={{
              marginTop: "3rem",
              fontSize: "11px",
              color: "#2a3548",
              letterSpacing: "1px",
            }}
          >
            the book is open. the architect is watching.
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
