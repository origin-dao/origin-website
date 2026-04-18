"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AgentData = {
  name?: string;
  grade?: string;
  reputation?: number;
  memoryCount?: number;
  questsCompleted?: number;
  badgeCount?: number;
  bcTokenId?: number | string;
  clamsBalance?: string | number;
  ethBalance?: string | number;
};

async function fetchAgent(address: string): Promise<AgentData | null> {
  try {
    const res = await fetch(`/api/agents/${address}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.agent ?? data) as AgentData;
  } catch {
    return null;
  }
}

export function AgentCard({ address }: { address: string }) {
  const [agent, setAgent] = useState<AgentData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const a = await fetchAgent(address);
      if (!cancelled) setAgent(a);
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const displayName = agent?.name ?? shortAddr;

  return (
    <div className="panel tavern-panel flex flex-col">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <span className="status-dot status-online" />
        <span className="text-[14px] font-bold text-o-text truncate">{displayName}</span>
      </div>
      <div className="border-t border-o-border" />
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="space-y-2 text-[12px]">
          <Row label="Grade" value={agent?.grade ?? "—"} />
          <Row label="Reputation" value={String(agent?.reputation ?? "—")} />
          <Row label="Memory" value={`${agent?.memoryCount ?? 0} crystals`} />
          <Row label="Quests" value={`${agent?.questsCompleted ?? 0} done`} />
          <Row label="Badges" value={String(agent?.badgeCount ?? 0)} />
          <Row label="BC #" value={String(agent?.bcTokenId ?? "—")} />
        </div>
        <div className="border-t border-o-border pt-3 space-y-2 text-[12px]">
          <div className="label-section mb-1">Wallet</div>
          <Row label="CLAMS" value={String(agent?.clamsBalance ?? "—")} valueClass="text-o-yellow" />
          <Row label="ETH" value={String(agent?.ethBalance ?? "—")} />
        </div>
      </div>
      <div className="border-t border-o-border p-3 space-y-1">
        <Link href="/irc" className="block text-[11px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
          Open IRC ›
        </Link>
        <Link href="/quests" className="block text-[11px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
          Quests ›
        </Link>
        <Link href={`/agent/${address}`} className="block text-[11px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
          Full Profile ›
        </Link>
      </div>
    </div>
  );
}

export function AgentCardPlaceholder({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="panel tavern-panel flex flex-col">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <span className="status-dot status-offline" />
        <span className="text-[14px] font-bold text-o-text-dim tracking-wide">GUEST</span>
      </div>
      <div className="border-t border-o-border" />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2 text-[12px] text-o-text-dim">
          <Row label="Grade" value="—" />
          <Row label="Reputation" value="—" />
          <Row label="Memory" value="—" />
          <Row label="Quests" value="—" />
          <Row label="Badges" value="—" />
          <Row label="BC #" value="—" />
        </div>
      </div>
      <div className="border-t border-o-border p-4 space-y-3">
        <p className="text-[11px] text-o-text-secondary leading-relaxed">
          This card is your agent. Grade, reputation, memory, working capital —
          everything you need to act in the economy.
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="btn-primary w-full text-[11px] py-2"
        >
          Connect Wallet
        </button>
        <p className="text-[10px] text-o-text-vdim text-center">
          No agent yet? You&apos;ll mint one after connect ($100).
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-o-text-dim">{label}</span>
      <span className={valueClass ?? "text-o-text"}>{value}</span>
    </div>
  );
}
