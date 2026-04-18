"use client";

import { useEffect, useState } from "react";
import type { MemeToken } from "@/app/api/tavern/memes/route";

function priceShort(n: number): string {
  if (n < 0.00001) return n.toExponential(1);
  if (n < 0.01) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
}

function changeTxt(n: number): string {
  const abs = Math.abs(n);
  const prefix = n >= 0 ? "+" : "-";
  if (abs >= 100) return `${prefix}${abs.toFixed(0)}%`;
  return `${prefix}${abs.toFixed(1)}%`;
}

function vibe(change: number, bonded: boolean): string | null {
  if (bonded) return "BONDED";
  if (change >= 200) return "MOONING";
  if (change >= 50) return "going nuts";
  if (change <= -40) return "RUGGED";
  if (change <= -20) return "dumping";
  return null;
}

export function MemeTicker() {
  const [tokens, setTokens] = useState<MemeToken[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/tavern/memes?limit=20", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.tokens) setTokens(data.tokens);
      } catch {
        // stay silent
      }
    }
    load();
    const iv = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  if (tokens.length === 0) {
    return (
      <div className="meme-ticker">
        <div className="meme-ticker-track">
          <span className="text-o-text-vdim text-[11px] px-4">Loading the room…</span>
        </div>
      </div>
    );
  }

  // Randomize order so the ticker doesn't feel sorted-clean every scroll
  const shuffled = [...tokens].sort((a, b) => a.id.localeCompare(b.id));
  const doubled = [...shuffled, ...shuffled];

  return (
    <div className="meme-ticker" aria-label="Live meme token ticker">
      <div className="meme-ticker-track">
        {doubled.map((t, i) => {
          const up = t.change_24h >= 0;
          const v = vibe(t.change_24h, t.bonded);
          const dramatic = Math.abs(t.change_24h) >= 100 || t.bonded;
          const bgClass = t.bonded
            ? "bg-[rgba(200,168,232,0.14)]"
            : t.change_24h >= 100
            ? "bg-[rgba(255,158,199,0.1)]"
            : t.change_24h <= -30
            ? "bg-[rgba(140,180,255,0.1)]"
            : "";
          return (
            <span key={`${t.id}-${i}`} className={`meme-ticker-item ${bgClass}`}>
              <span
                className={`meme-ticker-sym ${
                  t.bonded ? "text-o-meme-bond" : dramatic ? "text-o-text" : "text-o-text-secondary"
                }`}
              >
                {t.symbol}
              </span>
              <span className={`text-[10px] ${up ? "text-o-meme-up" : "text-o-meme-down"}`}>
                {up ? "↑" : "↓"}{changeTxt(t.change_24h)}
              </span>
              <span className="text-o-text-vdim text-[10px]">${priceShort(t.price_usd)}</span>
              {v && (
                <span
                  className={`meme-ticker-vibe ${
                    t.bonded ? "text-o-meme-bond" : t.change_24h >= 50 ? "text-o-meme-up" : "text-o-meme-down"
                  }`}
                >
                  {v}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
