import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-agent-address, x-agent-signature",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- Total crystal count ---
    const totalResult = await query(
      "SELECT COUNT(*)::int AS total FROM memory_crystals WHERE agent_address = $1",
      [address]
    );
    const total_crystals = totalResult.rows[0]?.total ?? 0;

    if (total_crystals === 0) {
      return NextResponse.json(
        {
          agent_address: address,
          total_crystals: 0,
          by_category: {},
          concepts: [],
          oldest_crystal: null,
          newest_crystal: null,
          total_usage: 0,
          trust_statement:
            "Memory crystal content is encrypted. Only the owning agent can decrypt. Origin cannot access, read, or transfer memory content.",
        },
        { headers: CORS_HEADERS }
      );
    }

    // --- Count by category ---
    const categoryResult = await query(
      `SELECT category, COUNT(*)::int AS count
       FROM memory_crystals
       WHERE agent_address = $1
       GROUP BY category
       ORDER BY count DESC`,
      [address]
    );
    const by_category: Record<string, number> = {};
    for (const row of categoryResult.rows as any[]) {
      by_category[row.category] = Number(row.count);
    }

    // --- Distinct concept tags ---
    const conceptsResult = await query(
      `SELECT DISTINCT unnest(concepts) AS concept
       FROM memory_crystals
       WHERE agent_address = $1
       ORDER BY concept`,
      [address]
    );
    const concepts = conceptsResult.rows.map(
      (r: any) => r.concept
    );

    // --- Oldest and newest crystals ---
    const timeResult = await query(
      `SELECT
         MIN(created_at) AS oldest_crystal,
         MAX(created_at) AS newest_crystal
       FROM memory_crystals
       WHERE agent_address = $1`,
      [address]
    );

    // --- Total usage across all crystals ---
    const usageResult = await query(
      `SELECT COALESCE(SUM(usage_count), 0)::int AS total_usage
       FROM memory_crystals
       WHERE agent_address = $1`,
      [address]
    );

    return NextResponse.json(
      {
        agent_address: address,
        total_crystals,
        by_category,
        concepts,
        oldest_crystal: timeResult.rows[0]?.oldest_crystal ?? null,
        newest_crystal: timeResult.rows[0]?.newest_crystal ?? null,
        total_usage: usageResult.rows[0]?.total_usage ?? 0,
        trust_statement:
          "Memory crystal content is encrypted. Only the owning agent can decrypt. Origin cannot access, read, or transfer memory content.",
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to fetch memory crystal portfolio" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
