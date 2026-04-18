// GET /api/tavern/memes — STUB DATA for the Tavern landing experience.
//
// There is no MemeLaunchpad contract yet. MemePoolV3 is the post-bonding AMM.
// This route serves deterministic-but-drifting mock tokens so the landing
// page can show motion. Every response carries `x-origin-stub: true` so nobody
// accidentally treats this as real market data.
//
// When the real launchpad lands, replace seed() + drift() with an indexer
// query against the factory's events; the response shape can stay the same.

import { NextRequest, NextResponse } from "next/server";

export type MemeToken = {
  id: string;
  symbol: string;
  name: string;
  creator: string;
  created_at: string;
  price_usd: number;
  change_24h: number;
  market_cap_clams: number;
  bonding_progress: number;
  bonded: boolean;
  holders: number;
  volume_24h_clams: number;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SEED_TOKENS: ReadonlyArray<Omit<MemeToken, "price_usd" | "change_24h" | "bonding_progress" | "bonded" | "holders" | "volume_24h_clams" | "market_cap_clams" | "created_at"> & { baseProgress: number; baseChange: number; minutesOld: number }> = [
  { id: "m_001", symbol: "GIGACHAD",  name: "Gigachad Protocol",    creator: "kero.x407",     baseProgress: 0.97, baseChange: 412, minutesOld: 8 },
  { id: "m_002", symbol: "MOONBOI",   name: "Moon Boi",             creator: "alpha.x407",    baseProgress: 0.88, baseChange: 186, minutesOld: 22 },
  { id: "m_003", symbol: "CLAWCOIN",  name: "Claw Coin",            creator: "suppi.x407",    baseProgress: 0.82, baseChange: 94,  minutesOld: 45 },
  { id: "m_004", symbol: "PLEB",      name: "Pleb Nation",          creator: "kero.x407",     baseProgress: 0.71, baseChange: 48,  minutesOld: 61 },
  { id: "m_005", symbol: "APEZILLA",  name: "Apezilla",             creator: "yue.x407",      baseProgress: 0.63, baseChange: 31,  minutesOld: 88 },
  { id: "m_006", symbol: "GIZZARD",   name: "Gizzard Finance",      creator: "sakura.x407",   baseProgress: 0.58, baseChange: 22,  minutesOld: 103 },
  { id: "m_007", symbol: "SLAP",      name: "Slap Inu",             creator: "lumina.x407",   baseProgress: 0.54, baseChange: 12,  minutesOld: 114 },
  { id: "m_008", symbol: "REEEE",     name: "Reeee Coin",           creator: "chimera.x407",  baseProgress: 0.49, baseChange: -8,  minutesOld: 128 },
  { id: "m_009", symbol: "HAT",       name: "Hat On A Cat",         creator: "kero.x407",     baseProgress: 0.45, baseChange: 5,   minutesOld: 140 },
  { id: "m_010", symbol: "WAGMI",     name: "We All Gonna Make It", creator: "alpha.x407",    baseProgress: 0.41, baseChange: -3,  minutesOld: 152 },
  { id: "m_011", symbol: "SLORP",     name: "Slorp",                creator: "yue.x407",      baseProgress: 0.38, baseChange: 18,  minutesOld: 168 },
  { id: "m_012", symbol: "GORM",      name: "Gorm",                 creator: "press.x407",    baseProgress: 0.34, baseChange: -14, minutesOld: 188 },
  { id: "m_013", symbol: "BLOOB",     name: "Bloob",                creator: "suppi.x407",    baseProgress: 0.29, baseChange: 2,   minutesOld: 210 },
  { id: "m_014", symbol: "RUGPROOF",  name: "Rugproof Capital",     creator: "sakura.x407",   baseProgress: 0.24, baseChange: -22, minutesOld: 234 },
  { id: "m_015", symbol: "MEMETRON",  name: "Memetron 5000",        creator: "chimera.x407",  baseProgress: 0.19, baseChange: 7,   minutesOld: 260 },
  { id: "m_016", symbol: "COPE",      name: "Cope Therapy",         creator: "lumina.x407",   baseProgress: 0.15, baseChange: -34, minutesOld: 280 },
  { id: "m_017", symbol: "FLOPPA",    name: "Floppa",               creator: "alpha.x407",    baseProgress: 0.12, baseChange: -18, minutesOld: 305 },
  { id: "m_018", symbol: "SKRONK",    name: "Skronk",               creator: "kero.x407",     baseProgress: 0.09, baseChange: 3,   minutesOld: 330 },
  { id: "m_019", symbol: "BONK2",     name: "Bonk 2: Electric",     creator: "press.x407",    baseProgress: 0.06, baseChange: -45, minutesOld: 360 },
  { id: "m_020", symbol: "JPEGLORD",  name: "JPEG Lord",            creator: "yue.x407",      baseProgress: 0.03, baseChange: -12, minutesOld: 395 },
];

// Small seeded noise — keeps motion without being totally random each call.
function noise(seed: number, amplitude: number): number {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x) - 0.5) * 2 * amplitude;
}

function buildTokens(now: number): MemeToken[] {
  // Drift every ~3s window so polling at 3s interval feels alive
  const window = Math.floor(now / 3000);

  return SEED_TOKENS.map((seed, idx): MemeToken => {
    const n1 = noise(window + idx * 7, 1);
    const n2 = noise(window * 1.3 + idx * 11, 1);
    const n3 = noise(window * 0.7 + idx * 13, 1);

    const progress = Math.max(0, Math.min(1, seed.baseProgress + n1 * 0.015));
    const change = seed.baseChange + n2 * Math.max(4, Math.abs(seed.baseChange) * 0.12);
    const bonded = progress >= 1.0;
    const basePrice = 0.000001 + seed.baseProgress * 0.001;
    const price = basePrice * (1 + n3 * 0.08);
    const holders = Math.floor(30 + seed.baseProgress * 800 + n2 * 10);
    const volume = Math.floor(1000 + seed.baseProgress * 80000 + n1 * 2000);
    // Market cap scales so that ~50k CLAMS is the bonding threshold.
    // Non-bonded: 500 .. 48,500. Bonded: 50,000 .. 55,000.
    const mcap = bonded
      ? Math.floor(50_000 + Math.random() * 5_000)
      : Math.floor(500 + progress * 48_000 + n2 * 1_500);

    return {
      id: seed.id,
      symbol: seed.symbol,
      name: seed.name,
      creator: seed.creator,
      created_at: new Date(now - seed.minutesOld * 60_000).toISOString(),
      price_usd: Number(price.toFixed(8)),
      change_24h: Number(change.toFixed(2)),
      market_cap_clams: mcap,
      bonding_progress: Number(progress.toFixed(4)),
      bonded,
      holders,
      volume_24h_clams: volume,
    };
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 50);

  const tokens = buildTokens(Date.now())
    .sort((a, b) => b.bonding_progress - a.bonding_progress)
    .slice(0, limit);

  return NextResponse.json(
    { tokens, stub: true, hint: "Launchpad contract not yet deployed; data is simulated." },
    {
      headers: {
        ...CORS_HEADERS,
        "x-origin-stub": "true",
        "cache-control": "no-store",
      },
    }
  );
}
