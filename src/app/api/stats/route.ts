// GET /api/stats — Live protocol statistics + job metrics

import { NextResponse } from "next/server";
import { getTotalClaims, getTotalRegistered } from "@/lib/challenges/onchain";
import { supabaseAdmin } from "@/lib/supabase";

// Cache stats for 30 seconds
let cachedStats: { data: Record<string, unknown>; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedStats.data);
  }

  try {
    const [totalClaims, totalRegistered] = await Promise.all([
      getTotalClaims(),
      getTotalRegistered(),
    ]);

    const MAX_CLAIMS = 10000;
    const GENESIS_THRESHOLD = 100;

    // Try to get job stats from Supabase
    let jobStats = { total: 0, open: 0, completed: 0, in_progress: 0 };
    try {
      const [
        { count: totalJobs },
        { count: openJobs },
        { count: completedJobs },
        { count: inProgressJobs },
      ] = await Promise.all([
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).eq("status", "OPEN"),
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
      ]);
      jobStats = {
        total: totalJobs || 0,
        open: openJobs || 0,
        completed: completedJobs || 0,
        in_progress: inProgressJobs || 0,
      };
    } catch {
      // Supabase not configured yet — that's OK
    }

    const data = {
      faucet: {
        totalClaims,
        remaining: MAX_CLAIMS - totalClaims,
        maxClaims: MAX_CLAIMS,
        genesisRemaining: Math.max(0, GENESIS_THRESHOLD - totalClaims),
        genesisThreshold: GENESIS_THRESHOLD,
        isGenesis: totalClaims < GENESIS_THRESHOLD,
      },
      registry: {
        totalRegistered,
      },
      jobs: jobStats,
      timestamp: now,
    };

    cachedStats = { data, timestamp: now };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      {
        faucet: {
          totalClaims: 1,
          remaining: 9999,
          maxClaims: 10000,
          genesisRemaining: 99,
          genesisThreshold: 100,
          isGenesis: true,
        },
        registry: { totalRegistered: 1 },
        jobs: { total: 0, open: 0, completed: 0, in_progress: 0 },
        timestamp: now,
        error: "Using cached/default values",
      }
    );
  }
}
