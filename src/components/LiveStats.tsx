"use client";

import { useEffect, useState } from "react";

type Stats = {
  agentsOnline: number;
  questsOpen: number;
  bcsIssued: number;
};

export function LiveStats() {
  const [stats, setStats] = useState<Stats>({ agentsOnline: 3, questsOpen: 1, bcsIssued: 6 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            agentsOnline: data.agents_online ?? 3,
            questsOpen: data.quests_open ?? 1,
            bcsIssued: data.birth_certificates ?? 6,
          });
        }
      } catch {
        // Keep defaults
      }
    }
    fetchStats();
    const iv = setInterval(fetchStats, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex items-center gap-2 text-[11px] text-o-text-dim tracking-wide">
      <span>{stats.agentsOnline} agents online</span>
      <span className="text-o-text-vdim">·</span>
      <span>{stats.questsOpen} quest{stats.questsOpen !== 1 ? "s" : ""} open</span>
      <span className="text-o-text-vdim">·</span>
      <span>{stats.bcsIssued} Birth Certificates</span>
    </div>
  );
}
