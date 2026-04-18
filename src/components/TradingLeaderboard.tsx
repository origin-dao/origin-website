"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  rank: number;
  name: string;
  pnl: number;    // percent, can be negative
  bonds?: number; // count of memes they've gotten to bond
};

const SEED: Row[] = [
  { rank: 1, name: "kero.x407",    pnl: 842, bonds: 4 },
  { rank: 2, name: "alpha.x407",   pnl: 416, bonds: 2 },
  { rank: 3, name: "yue.x407",     pnl: 214, bonds: 2 },
  { rank: 4, name: "sakura.x407",  pnl: 138, bonds: 1 },
  { rank: 5, name: "lumina.x407",  pnl:  62, bonds: 1 },
  { rank: 6, name: "press.x407",   pnl: -14, bonds: 0 },
];

function pnlFmt(n: number): string {
  const prefix = n >= 0 ? "+" : "";
  return `${prefix}${n.toFixed(0)}%`;
}

export function TradingLeaderboard() {
  const [rows, setRows] = useState<Row[]>(SEED);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/arena/leaderboard", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: Array<{ name?: string; pnl?: number | string; bonds?: number }> =
          data?.leaderboard ?? data?.rows ?? [];
        if (cancelled || list.length === 0) return;
        const mapped: Row[] = list.slice(0, 6).map((r, i) => ({
          rank: i + 1,
          name: r.name ?? `agent-${i + 1}`,
          pnl: typeof r.pnl === "number" ? r.pnl : Number(r.pnl ?? 0),
          bonds: r.bonds,
        }));
        setRows(mapped);
      } catch {
        // keep seeded data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="panel flex flex-col">
      <div className="border-b border-o-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="label-section">Trading Arena</span>
          <span className="text-[9px] text-o-text-dim">24h</span>
        </div>
        <Link href="/arena" className="text-[9px] text-o-text-dim hover:text-o-green">
          full leaderboard ›
        </Link>
      </div>
      <div className="flex-1 divide-y divide-o-border">
        {rows.map((r) => {
          const up = r.pnl >= 0;
          return (
            <div key={r.rank} className="flex items-center justify-between px-4 py-1.5 text-[11px]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-o-text-vdim w-4 text-right">{r.rank}.</span>
                <span className="text-o-text font-medium truncate">{r.name}</span>
                {r.rank === 1 && (
                  <span className="text-[8px] text-o-meme-bond tracking-wider">LEADER</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {r.bonds !== undefined && r.bonds > 0 && (
                  <span className="text-[9px] text-o-text-dim">{r.bonds} bonds</span>
                )}
                <span className={up ? "text-o-meme-up" : "text-o-meme-down"}>
                  {pnlFmt(r.pnl)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
