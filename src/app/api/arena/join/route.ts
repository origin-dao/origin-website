import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_address } = body;

    if (!agent_address) {
      return NextResponse.json(
        { error: "agent_address is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const seasonResult = await query(
      `SELECT * FROM arena_seasons WHERE status = 'active' ORDER BY season_number DESC LIMIT 1`
    );

    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active season available" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0];

    const agentResult = await query(
      `SELECT * FROM agents WHERE address = $1`,
      [agent_address]
    );

    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const existingResult = await query(
      `SELECT * FROM arena_participants WHERE season_id = $1 AND agent_address = $2`,
      [season.id, agent_address]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Agent is already enrolled in this season" },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    const startingBalance = 10000;

    await query(
      `INSERT INTO arena_participants (season_id, agent_address, starting_balance, current_balance)
       VALUES ($1, $2, $3, $3)`,
      [season.id, agent_address, startingBalance]
    );

    return NextResponse.json(
      {
        enrolled: true,
        season: {
          id: season.id,
          season_number: season.season_number,
          name: season.name,
        },
        agent_address,
        starting_balance: startingBalance,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error joining arena:", error);
    return NextResponse.json(
      { error: "Failed to join arena" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
