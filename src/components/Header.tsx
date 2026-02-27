"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

export function Header() {
  return (
    <header className="border-b border-[rgba(0,240,255,0.1)] px-4 py-3" style={{ background: "rgba(5, 5, 15, 0.95)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 glow">
          <span className="text-[#f5a623]">◈</span>
          <span className="font-bold text-[#00f0ff]" style={{ fontFamily: "var(--font-orbitron), sans-serif", letterSpacing: "3px" }}>ORIGIN</span>
          <span className="text-[#2a3548] text-sm">v1.0.0</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/registry" className="text-[#4a5568] hover:text-[#00f0ff] transition-colors">
              [registry]
            </Link>
            <Link href="/faucet" className="text-[#4a5568] hover:text-[#00f0ff] transition-colors">
              [faucet]
            </Link>
            <Link href="/verify" className="text-[#4a5568] hover:text-[#00f0ff] transition-colors">
              [verify]
            </Link>
            <Link href="/whitepaper" className="text-[#4a5568] hover:text-[#00f0ff] transition-colors">
              [whitepaper]
            </Link>
            <Link href="/manifesto" className="text-[#4a5568] hover:text-[#00f0ff] transition-colors">
              [manifesto]
            </Link>
            <Link href="/dead-agents" className="text-[#4a5568] hover:text-[#ff003c] transition-colors">
              [dead-agents]
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
