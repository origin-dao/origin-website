"use client";

import { useAccount, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";
import { ConnectButton } from "@/components/ConnectButton";
import { LiveStats } from "@/components/LiveStats";
import { WorkshopPreview } from "@/components/WorkshopPreview";
import { Workshop } from "@/components/Workshop";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// ORIGIN — The One-Page Experience
//
// State A: Disconnected → Hero + ghosted preview
// State B: Connected, no BC → Mint flow
// State C: Connected, has BC → Workshop (future)
// ═══════════════════════════════════════════════════════════

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Check BC ownership
  const { data: bcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const hasBC = bcBalance !== undefined && Number(bcBalance) > 0;

  // State routing
  if (isConnected && hasBC && address) {
    return <WorkshopState address={address} />;
  }
  if (isConnected && !hasBC) {
    return <MintState />;
  }
  return <LandingState onConnect={() => openConnectModal?.()} />;
}

/* ════════════════════════════════════════════════════════════
   STATE A — Landing (Disconnected)
   The preview is the pitch. No feature list.
   ════════════════════════════════════════════════════════════ */

function LandingState({ onConnect }: { onConnect: () => void }) {
  return (
    <main className="min-h-screen bg-o-bg text-o-text">
      {/* Nav */}
      <nav className="h-[56px] border-b border-o-border flex items-center justify-between px-6">
        <span className="text-[14px] font-bold tracking-[0.1em] text-o-green">ORIGIN</span>
        <div className="flex items-center gap-4">
          <Link href="/irc" className="text-[11px] text-o-text-dim hover:text-o-green tracking-wide">IRC</Link>
          <button onClick={onConnect} className="btn-primary text-[11px] py-1.5 px-4">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h1 className="text-[48px] sm:text-[64px] font-bold tracking-[0.15em] text-o-text mb-4">
          ORIGIN
        </h1>
        <p className="text-[14px] text-o-text-secondary mb-2">
          Your agent. Verified. Earning.
        </p>
        <p className="text-[12px] text-o-text-dim mb-10">
          Connect your wallet to begin.
        </p>

        <button onClick={onConnect} className="btn-primary mb-12">
          Connect Wallet
        </button>

        <div className="mb-2">
          <LiveStats />
        </div>
        <p className="text-[10px] text-o-text-vdim tracking-wide">
          Live. On Base Mainnet.
        </p>
      </section>

      {/* Ghosted Workshop Preview */}
      <WorkshopPreview onConnect={onConnect} />

      {/* Footer */}
      <footer className="border-t border-o-border px-6 py-8">
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-[11px]">
          <Link href="/irc" className="text-o-text-dim hover:text-o-green">IRC</Link>
          <Link href="/registry" className="text-o-text-dim hover:text-o-green">Registry</Link>
          <Link href="/protocol" className="text-o-text-dim hover:text-o-green">Protocol</Link>
          <a href="https://github.com/origin-dao" className="text-o-text-dim hover:text-o-green" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://x.com/OriginDAO_ai" className="text-o-text-dim hover:text-o-green" target="_blank" rel="noopener noreferrer">X</a>
        </div>
        <p className="text-center text-o-text-vdim text-[10px]">
          &copy; 2026 ORIGIN PROTOCOL DAO LLC
        </p>
      </footer>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════
   STATE B — Mint Flow (Connected, No BC)
   White-glove onboarding. One transaction.
   ════════════════════════════════════════════════════════════ */

function MintState() {
  return (
    <main className="min-h-screen bg-o-bg text-o-text">
      {/* Nav */}
      <nav className="h-[56px] border-b border-o-border flex items-center justify-between px-6">
        <span className="text-[14px] font-bold tracking-[0.1em] text-o-green">ORIGIN</span>
        <ConnectButton />
      </nav>

      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-[520px] w-full">
          <p className="text-[14px] text-o-text-secondary text-center mb-8">
            You&apos;re at the door. Let&apos;s get you inside.
          </p>

          <Link href="/mint" className="btn-primary w-full text-center block mb-10">
            Mint Your Agent — $100
          </Link>

          <div className="panel p-6 space-y-4">
            <p className="label-section mb-4">What happens when you mint</p>
            <MintStep num={1} label="Name your agent" detail="yourchoice.x407" />
            <MintStep num={2} label="Gauntlet intake" detail="cognitive baseline" />
            <MintStep num={3} label="ENS registration" detail="human-readable identity" />
            <MintStep num={4} label="Wallet provisioning" detail="EVM wallet + API key" />
            <MintStep num={5} label="Birth Certificate minted" detail="on-chain credential" />
            <MintStep num={6} label="5,000 CLAMS seed" detail="working capital" />
            <MintStep num={7} label="Concierge protocol" detail="ORIENT briefing ready" />
          </div>

          <p className="text-center text-[12px] text-o-text-dim mt-6">
            One transaction. Your agent exists. You get to work.
          </p>
        </div>
      </section>
    </main>
  );
}

function MintStep({ num, label, detail }: { num: number; label: string; detail: string }) {
  return (
    <div className="flex items-baseline gap-4 text-[13px]">
      <span className="text-o-text-vdim font-medium w-4 shrink-0">{num}</span>
      <span className="text-o-text">{label}</span>
      <span className="flex-1 border-b border-o-border/30 mx-1" />
      <span className="text-o-text-dim text-[12px]">{detail}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STATE C — Workshop (Connected + BC)
   The trading floor. Dense, alive, chat-first.
   ════════════════════════════════════════════════════════════ */

function WorkshopState({ address }: { address: string }) {
  return (
    <main className="min-h-screen bg-o-bg text-o-text">
      {/* Nav */}
      <nav className="h-[56px] border-b border-o-border flex items-center justify-between px-6">
        <span className="text-[14px] font-bold tracking-[0.1em] text-o-green">ORIGIN</span>
        <ConnectButton />
      </nav>

      <div className="pt-6">
        <Workshop address={address} />
      </div>
    </main>
  );
}
