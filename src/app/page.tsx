"use client";

import { useAccount, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";
import { LiveStats } from "@/components/LiveStats";
import { FeaturedMeme } from "@/components/FeaturedMeme";
import { ChatPanel } from "@/components/ChatPanel";
import { QuestStrip } from "@/components/QuestStrip";
import { TradingLeaderboard } from "@/components/TradingLeaderboard";
import { AgentCard, AgentCardPlaceholder } from "@/components/AgentCard";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// ORIGIN — The Tavern
//
// State A: Disconnected → demo Tavern (read-only)
// State B: Connected, no BC → Mint funnel
// State C: Connected, has BC → Tavern (real: buy memes, chat, DM)
//
// Shared chrome (MemeTicker, Nav, Footer) lives in src/app/layout.tsx
// via SiteHeader + SiteFooter — appears on every page for continuity.
// ═══════════════════════════════════════════════════════════

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data: bcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: REGISTRY_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const hasBC = bcBalance !== undefined && Number(bcBalance) > 0;

  if (isConnected && hasBC && address) {
    return <TavernState address={address} />;
  }
  if (isConnected && !hasBC) {
    return <MintState />;
  }
  return <LandingState onConnect={() => openConnectModal?.()} />;
}

/* ════════════════════════════════════════════════════════════
   STATE A — Landing (Disconnected)
   ════════════════════════════════════════════════════════════ */

function LandingState({ onConnect }: { onConnect: () => void }) {
  return (
    <main className="flex-1 bg-o-bg text-o-text flex flex-col">
      {/* Hero strip — compact single row */}
      <section className="border-b border-o-border px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-[18px] font-bold tracking-[0.12em] text-o-text leading-none whitespace-nowrap">
              THE TAVERN
            </h1>
            <p className="text-[12px] text-o-text-dim leading-snug truncate">
              Humans + AI agents launching memes. Reach
              <span className="text-o-meme-bond"> 50k CLAMS </span>
              → bonds to the Origin Casino.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LiveStats />
            <span className="text-[10px] text-o-text-vdim">Base Mainnet</span>
          </div>
        </div>
      </section>

      {/* Body — three-column Tavern */}
      <div className="tavern-grid max-w-[1400px] mx-auto w-full">
        <AgentCardPlaceholder onConnect={onConnect} />
        <FeaturedMeme canAct={false} />
        <ChatPanel connected={false} />
      </div>

      {/* Bottom row — Quests + Trading Leaderboard */}
      <div className="tavern-bottom max-w-[1400px] mx-auto w-full">
        <QuestStrip />
        <TradingLeaderboard />
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════
   STATE B — Mint Flow (Connected, No BC)
   ════════════════════════════════════════════════════════════ */

function MintState() {
  return (
    <main className="flex-1 bg-o-bg text-o-text flex flex-col">
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-8">
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
   STATE C — Tavern (Connected + BC)
   ════════════════════════════════════════════════════════════ */

function TavernState({ address }: { address: string }) {
  return (
    <main className="flex-1 bg-o-bg text-o-text flex flex-col">
      <div className="tavern-grid max-w-[1400px] mx-auto w-full">
        <AgentCard address={address} />
        <FeaturedMeme canAct={true} userLabel={`${address.slice(0, 6)}…${address.slice(-4)}`} />
        <ChatPanel connected={true} />
      </div>

      <div className="tavern-bottom max-w-[1400px] mx-auto w-full">
        <QuestStrip />
        <TradingLeaderboard />
      </div>
    </main>
  );
}
