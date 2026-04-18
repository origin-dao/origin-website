"use client";

import { useEffect, useRef, useState } from "react";
import { MemeChart } from "@/components/MemeChart";
import type { MemeToken } from "@/app/api/tavern/memes/route";

function formatPrice(n: number): string {
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

function formatChange(n: number): string {
  const prefix = n >= 0 ? "+" : "";
  return `${prefix}${n.toFixed(1)}%`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

type Cheer = { id: number; time: string; text: string; kind: "hype" | "trade" };

const HYPE_LINES = [
  "LFG",
  "send it",
  "bond or die",
  "WAGMI",
  "we gonna make it",
  "buy the dip",
  "diamond hands",
  "paper hands NGMI",
  "to the moon",
  "stop selling",
  "one more push",
  "it's happening",
  "let's go let's go",
  "VOLUME VOLUME VOLUME",
  "don't fade this",
  "chart is cooking",
  "up only",
  "shut up and buy",
  "green candles pls",
  "GM to everyone bonding this one",
  "HOLD",
  "i'm all in",
  "this is the one",
];

const TRADE_LINES = [
  "new buy: 800 CLAMS",
  "new buy: 2.4k CLAMS",
  "new buy: 840 CLAMS",
  "new buy: 5.6k CLAMS",
  "new buy: 120 CLAMS",
  "new sell: 1.2k CLAMS",
  "new buy: 3.1k CLAMS",
  "new sell: 400 CLAMS",
  "whale bought 12k",
  "paper hand sold 600",
];

function seedCheersFor(symbol: string): Cheer[] {
  return [
    { id: 1, time: "09:00", text: `${symbol} LFG`,        kind: "hype" },
    { id: 2, time: "09:00", text: "new buy: 2.4k CLAMS",  kind: "trade" },
    { id: 3, time: "09:01", text: "bond or die",          kind: "hype" },
    { id: 4, time: "09:01", text: "we gonna make it",     kind: "hype" },
  ];
}

function pickCheer(): Omit<Cheer, "id" | "time"> {
  // 35% chance of a trade line, 65% hype
  if (Math.random() < 0.35) {
    return { text: TRADE_LINES[Math.floor(Math.random() * TRADE_LINES.length)], kind: "trade" };
  }
  return { text: HYPE_LINES[Math.floor(Math.random() * HYPE_LINES.length)], kind: "hype" };
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function FeaturedMeme({
  canAct = false,
  userLabel = "you",
}: {
  canAct?: boolean;
  userLabel?: string;
}) {
  const [token, setToken] = useState<MemeToken | null>(null);
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function sendCheer() {
    const text = draft.trim();
    if (!text) return;
    setCheers((prev) => [
      ...prev.slice(-10),
      {
        id: Date.now(),
        time: hhmm(new Date()),
        text: `${userLabel}: ${text}`,
        kind: "hype",
      },
    ]);
    setDraft("");
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/tavern/memes?limit=20", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const tokens = (data?.tokens ?? []) as MemeToken[];
        if (cancelled || tokens.length === 0) return;
        const hottest = tokens.find((t) => !t.bonded) ?? tokens[0];
        setToken((prev) => {
          if (!prev) {
            setCheers(seedCheersFor(hottest.symbol));
            return hottest;
          }
          if (prev.id !== hottest.id) {
            setCheers(seedCheersFor(hottest.symbol));
          }
          return hottest;
        });
      } catch {
        // keep prior
      }
    }
    load();
    const iv = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  // Ambient cheers: append one every 2.5-4s to feel alive without overwhelming
  useEffect(() => {
    if (!token) return;
    const iv = setInterval(() => {
      const pick = pickCheer();
      setCheers((prev) => {
        const next: Cheer = { ...pick, id: Date.now(), time: hhmm(new Date()) };
        return [...prev.slice(-10), next];
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cheers.length]);

  if (!token) {
    return (
      <div className="panel tavern-panel flex flex-col">
        <div className="border-b border-o-border px-4 py-3">
          <span className="label-section">The Tavern</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-o-text-vdim text-[12px]">
          Loading the room…
        </div>
      </div>
    );
  }

  const up = token.change_24h >= 0;

  return (
    <div className="panel tavern-panel flex flex-col">
      {/* Header — slim, with symbol + stats inline */}
      <div className="border-b border-o-border px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="label-section">Featured</span>
          <span className="text-o-text font-bold text-[15px]">{token.symbol}</span>
          <span className="text-o-text-dim text-[11px] truncate">· {token.name}</span>
          {token.bonded && (
            <span className="text-[8px] text-o-bg bg-o-meme-bond px-1.5 py-[1px] font-bold tracking-wider">
              BONDED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-o-text-vdim tracking-wider border border-o-border px-1.5 py-[2px]">
            BETA · SIMULATED
          </span>
          <button
            type="button"
            disabled
            title="Launchpad contract not yet deployed — buy/sell routing coming in Phase 3"
            className="text-[10px] py-1 px-3 border border-o-border text-o-text-vdim cursor-not-allowed"
          >
            Buy
          </button>
          <button
            type="button"
            disabled
            title="Launchpad contract not yet deployed — buy/sell routing coming in Phase 3"
            className="text-[10px] py-1 px-3 border border-o-border text-o-text-vdim cursor-not-allowed"
          >
            Sell
          </button>
        </div>
      </div>

      {/* Stats strip — one compact line */}
      <div className="border-b border-o-border px-4 py-1.5 flex items-center gap-3 text-[11px] flex-wrap">
        <span className="text-o-text font-semibold">{formatPrice(token.price_usd)}</span>
        <span className={up ? "text-o-meme-up" : "text-o-meme-down"}>
          {up ? "▲" : "▼"} {formatChange(token.change_24h)}
        </span>
        <span className="text-o-text-dim">mcap {formatCompact(token.market_cap_clams)}</span>
        <span className="text-o-text-dim">vol {formatCompact(token.volume_24h_clams)}</span>
        <span className="text-o-text-dim">{formatCompact(token.holders)} holders</span>
        <span className="text-o-meme-bond">{Math.round(token.bonding_progress * 100)}% → 50k</span>
        <span className="ml-auto text-o-text-vdim">by {token.creator}</span>
      </div>

      {/* Chart — slimmer */}
      <div className="px-4 py-2 border-b border-o-border">
        <MemeChart
          anchorMcap={token.market_cap_clams}
          bondingProgress={token.bonding_progress}
          bondingMcap={50_000}
          height={180}
        />
      </div>

      {/* Cheer strip — short hype lines scrolling */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-[3px] text-[11px]"
      >
        {cheers.map((c) => (
          <div key={c.id} className="flex gap-3 leading-tight">
            <span className="text-o-text-vdim text-[9px] min-w-[32px] shrink-0 pt-[1px]">{c.time}</span>
            <span className={c.kind === "trade" ? "text-o-teal" : "text-o-text-secondary"}>
              {c.text}
            </span>
          </div>
        ))}
      </div>

      {/* Cheer input — always enabled, local-only until backend lands */}
      <div className="border-t border-o-border px-3 py-2 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendCheer();
          }}
          placeholder={`preview · cheer ${token.symbol} on…`}
          className="flex-1 bg-transparent text-[12px] text-o-text outline-none placeholder:text-o-text-vdim"
          maxLength={120}
        />
        <button
          type="button"
          onClick={sendCheer}
          disabled={!draft.trim()}
          className="text-[10px] text-o-meme-up hover:text-o-meme-bond disabled:text-o-text-vdim disabled:cursor-not-allowed px-2"
        >
          send ›
        </button>
      </div>
    </div>
  );
}
