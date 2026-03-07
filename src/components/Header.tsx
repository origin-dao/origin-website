"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

const NAV_LINKS = [
  { href: "/registry", label: "registry" },
  { href: "/faucet", label: "faucet" },
  { href: "/staking", label: "war chest", color: "var(--neon-green, #00FFC8)" },
  { href: "/verify", label: "verify agent" },
  { href: "/whitepaper", label: "whitepaper" },
  { href: "/manifesto", label: "manifesto" },
  { href: "/contracts", label: "contracts" },
  { href: "/dead-agents", label: "dead agents", color: "var(--neon-red, #FF0040)" },
];

export function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid rgba(0,255,200,0.1)",
        padding: "10px 24px",
        background: "rgba(3,8,8,0.95)",
        backdropFilter: "blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ color: "var(--neon-yellow, #FFE600)", fontSize: 14 }}>◈</span>
          <span
            style={{
              fontFamily: "var(--display, 'Orbitron', monospace)",
              fontWeight: 900,
              fontSize: 16,
              color: "var(--neon-green, #00FFC8)",
              letterSpacing: 3,
              textShadow: "0 0 10px rgba(0,255,200,0.3)",
            }}
          >
            ORIGIN
          </span>
          <span style={{ fontFamily: "var(--mono, monospace)", fontSize: 9, color: "var(--dim, #3A4A42)", letterSpacing: 1 }}>
            v1.0.0
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <nav style={{ display: "flex", gap: 4 }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--mono, monospace)",
                  fontSize: 10,
                  color: "var(--dim, #3A4A42)",
                  textDecoration: "none",
                  padding: "4px 8px",
                  letterSpacing: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = link.color || "var(--neon-green, #00FFC8)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--dim, #3A4A42)";
                }}
              >
                [{link.label}]
              </Link>
            ))}
          </nav>
          <a
            href="https://x.com/OriginDAO_ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on X"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 6px",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              const svg = (e.currentTarget as HTMLElement).querySelector("svg");
              if (svg) svg.style.fill = "#00f0ff";
            }}
            onMouseLeave={(e) => {
              const svg = (e.currentTarget as HTMLElement).querySelector("svg");
              if (svg) svg.style.fill = "#f5a623";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#f5a623"
              style={{ transition: "fill 0.15s" }}
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
