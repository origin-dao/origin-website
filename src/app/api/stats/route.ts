// GET /api/stats — Live protocol statistics

import { NextResponse } from "next/server";
import { getTotalClaims, getTotalRegistered } from "@/lib/challenges/onchain";

// Cache stats for 30 seconds to avoid hammering RPC
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
        timestamp: now,
        error: "Using cached/default values",
      }
    );
  }
}
