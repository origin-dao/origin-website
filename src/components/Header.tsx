"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

export function Header() {
  return (
    <header className="border-b border-terminal-dark px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 glow">
          <span className="text-terminal-amber">🐾</span>
          <span className="font-bold">ORIGIN</span>
          <span className="text-terminal-dim text-sm">v1.0.0</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/registry" className="hover:text-terminal-amber transition-colors">
              [registry]
            </Link>
            <Link href="/faucet" className="hover:text-terminal-amber transition-colors">
              [faucet]
            </Link>
            <Link href="/verify" className="hover:text-terminal-amber transition-colors">
              [verify]
            </Link>
            <Link href="/whitepaper" className="hover:text-terminal-amber transition-colors">
              [whitepaper]
            </Link>
            <Link href="/manifesto" className="hover:text-terminal-amber transition-colors">
              [manifesto]
            </Link>
            <Link href="/dead-agents" className="hover:text-terminal-amber transition-colors text-terminal-dim hover:text-terminal-red">
              [dead-agents]
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
