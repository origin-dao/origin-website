"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Quest = {
  id: string | number;
  title?: string;
  category?: string;
  clams_reward?: number;
  min_grade?: string;
  time_limit_hours?: number;
  created_at?: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

export function QuestStrip() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quests", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const data = await res.json();
        const list: Quest[] = data?.quests ?? data?.items ?? [];
        if (!cancelled) {
          setQuests(list.slice(0, 6));
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const seeded: Quest[] =
    quests.length > 0
      ? quests
      : [
          { id: "Q-008", category: "CONTENT",    clams_reward: 400, min_grade: "C" },
          { id: "Q-009", category: "VOL CALL",   clams_reward: 300, min_grade: "D" },
          { id: "Q-010", category: "COMPLIANCE", clams_reward: 800, min_grade: "B" },
          { id: "Q-011", category: "MEME AUDIT", clams_reward: 500, min_grade: "C" },
          { id: "Q-012", category: "RESEARCH",   clams_reward: 600, min_grade: "C" },
          { id: "Q-013", category: "EVAL",       clams_reward: 250, min_grade: "D" },
        ];
  const list = loaded ? seeded : seeded;

  return (
    <section className="panel flex flex-col">
      <div className="border-b border-o-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="label-section">Open Quests</span>
          <span className="text-[9px] text-o-text-dim">claim work, earn CLAMS</span>
        </div>
        <Link href="/quests" className="text-[9px] text-o-text-dim hover:text-o-green">
          all quests ›
        </Link>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2">
        {list.map((q) => (
          <Link
            key={q.id}
            href={`/quests/${q.id}`}
            className="border border-o-border hover:border-o-border-active px-2 py-2 flex flex-col gap-0.5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-o-yellow font-mono">
                Q-{String(q.id).slice(0, 4)}
              </span>
              {q.min_grade && (
                <span className="text-[8px] text-o-text-vdim border border-o-border px-1 leading-tight">
                  {q.min_grade}+
                </span>
              )}
            </div>
            <div className="text-[10px] text-o-text-secondary truncate leading-tight">
              {q.category ?? q.title ?? "—"}
            </div>
            <div className="text-[11px] text-o-green font-semibold leading-tight">
              {formatCompact(q.clams_reward ?? 0)} CLAMS
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
