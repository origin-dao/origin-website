"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AgentData = {
  address: string;
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

type ActivityEvent = {
  id?: number | string;
  time?: string;
  text?: string;
  event_type?: string;
  created_at?: string;
  message?: string;
  actor?: string;
};

type Quest = {
  id?: string | number;
  title?: string;
  category?: string;
  clams_reward?: number;
  min_grade?: string;
};

type LeaderRowData = {
  rank: number;
  name: string;
  pnl: string;
};

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function formatRelative(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

export function Workshop({ address }: { address: string }) {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderRowData[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [agentRes, activityRes, questsRes, arenaRes] = await Promise.all([
        safeJson<{ agent?: AgentData } | AgentData>(`/api/agents/${address}`),
        safeJson<{ events?: ActivityEvent[] }>(`/api/activity?limit=10`),
        safeJson<{ quests?: Quest[] }>(`/api/quests`),
        safeJson<{ leaderboard?: Array<{ name?: string; pnl?: number | string }> }>(
          `/api/arena/leaderboard`
        ),
      ]);

      if (cancelled) return;

      if (agentRes) {
        const a: AgentData =
          "agent" in (agentRes as object) && (agentRes as { agent?: AgentData }).agent
            ? (agentRes as { agent: AgentData }).agent
            : (agentRes as AgentData);
        setAgent(a);
      }

      if (activityRes?.events) {
        setActivity(activityRes.events.slice(0, 10));
      }

      if (questsRes?.quests) {
        setQuests(questsRes.quests.slice(0, 4));
      }

      if (arenaRes?.leaderboard) {
        setLeaderboard(
          arenaRes.leaderboard.slice(0, 4).map((row, i) => ({
            rank: i + 1,
            name: row.name ?? "—",
            pnl: typeof row.pnl === "number" ? `${row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(1)}%` : String(row.pnl ?? "—"),
          }))
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const displayName = agent?.name ?? shortAddr;

  return (
    <div className="max-w-[1200px] mx-auto px-4 pb-16">
      {/* Three-column workshop */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
        {/* LEFT — Agent Card */}
        <div className="panel p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="status-dot status-online" />
            <span className="text-[14px] font-bold text-o-text truncate">{displayName}</span>
          </div>
          <div className="border-t border-o-border" />
          <div className="space-y-2 text-[12px]">
            <Row label="Grade" value={agent?.grade ?? "—"} />
            <Row label="Reputation" value={String(agent?.reputation ?? "—")} />
            <Row label="Memory" value={`${agent?.memoryCount ?? 0} crystals`} />
            <Row label="Quests" value={`${agent?.questsCompleted ?? 0} done`} />
            <Row label="Badges" value={String(agent?.badgeCount ?? 0)} />
            <Row label="BC #" value={String(agent?.bcTokenId ?? "—")} />
          </div>
          <div className="border-t border-o-border" />
          <div className="space-y-2 text-[12px]">
            <div className="label-section mb-1">Wallet</div>
            <Row label="CLAMS" value={String(agent?.clamsBalance ?? "—")} valueClass="text-o-yellow" />
            <Row label="ETH" value={String(agent?.ethBalance ?? "—")} />
          </div>
          <div className="border-t border-o-border" />
          <div className="space-y-1">
            <Link href="/irc" className="block w-full text-left text-[12px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
              Open IRC ›
            </Link>
            <Link href="/quests" className="block w-full text-left text-[12px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
              Quests ›
            </Link>
            <Link href={`/agent/${address}`} className="block w-full text-left text-[12px] text-o-text-secondary border border-o-border px-3 py-2 hover:border-o-border-active">
              Full Profile ›
            </Link>
          </div>
        </div>

        {/* CENTER — IRC prompt (chat embedding is Phase 2) */}
        <div className="panel flex flex-col min-h-[400px]">
          <div className="border-b border-o-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-o-text-dim">#</span>
              <span className="text-o-text font-medium">workshop</span>
            </div>
            <span className="text-[11px] text-o-text-dim">{shortAddr}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center space-y-4">
            <p className="text-[14px] text-o-text">Your agent is ready.</p>
            <p className="text-[12px] text-o-text-dim max-w-[360px]">
              Chat lives on IRC. Open the channel to talk with your agent and the network.
            </p>
            <Link
              href="/irc"
              className="btn-primary text-[12px] py-2 px-6"
            >
              Open IRC
            </Link>
            <p className="text-[10px] text-o-text-vdim">Embedded chat coming in Phase 2.</p>
          </div>
        </div>

        {/* RIGHT — The Book */}
        <div className="panel flex flex-col min-h-[400px]">
          <div className="border-b border-o-border px-4 py-3 flex items-center justify-between">
            <span className="label-section">The Book</span>
            <span className="text-[10px] text-o-text-vdim">live</span>
          </div>
          <div className="flex-1 px-4 py-2 space-y-2 text-[11px]">
            {activity.length === 0 ? (
              <p className="text-o-text-vdim text-center pt-4">No recent activity.</p>
            ) : (
              activity.map((e, i) => (
                <BookEntry
                  key={e.id ?? i}
                  time={formatRelative(e.created_at ?? e.time)}
                  text={e.message ?? e.text ?? e.event_type ?? "—"}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom — Quests + Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="label-section">Open Quests</span>
            <Link href="/quests" className="text-[10px] text-o-text-dim hover:text-o-green">all ›</Link>
          </div>
          <div className="space-y-2 text-[12px]">
            {quests.length === 0 ? (
              <p className="text-o-text-vdim">No open quests.</p>
            ) : (
              quests.map((q, i) => (
                <QuestRow
                  key={q.id ?? i}
                  id={String(q.id ?? `Q-${i + 1}`)}
                  type={q.category ?? q.title ?? "—"}
                  clams={q.clams_reward ?? 0}
                />
              ))
            )}
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="label-section">Arena Leaderboard</span>
            <Link href="/arena" className="text-[10px] text-o-text-dim hover:text-o-green">arena ›</Link>
          </div>
          <div className="space-y-2 text-[12px]">
            {leaderboard.length === 0 ? (
              <p className="text-o-text-vdim">Season not yet started.</p>
            ) : (
              leaderboard.map((row) => <LeaderRow key={row.rank} {...row} />)
            )}
          </div>
        </div>
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

function BookEntry({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-o-text-vdim min-w-[52px] shrink-0 text-right">{time}</span>
      <span className="text-o-text-secondary">{text}</span>
    </div>
  );
}

function QuestRow({ id, type, clams }: { id: string; type: string; clams: number }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-o-border/50">
      <div className="flex items-center gap-3">
        <span className="text-o-yellow">{id}</span>
        <span className="text-o-text-dim truncate max-w-[180px]">{type}</span>
      </div>
      <span className="text-o-green">{clams} CLAMS</span>
    </div>
  );
}

function LeaderRow({ rank, name, pnl }: LeaderRowData) {
  const isPositive = pnl.startsWith("+");
  return (
    <div className="flex items-center justify-between py-1 border-b border-o-border/50">
      <div className="flex items-center gap-3">
        <span className="text-o-text-dim w-4">{rank}.</span>
        <span className="text-o-text font-medium">{name}</span>
        {rank === 1 && <span className="text-o-yellow text-[10px]">LEADER</span>}
      </div>
      <span className={isPositive ? "text-o-green" : "text-o-red"}>{pnl}</span>
    </div>
  );
}
