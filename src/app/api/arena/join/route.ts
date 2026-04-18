// ═══════════════════════════════════════════════════════════
// POST /api/arena/join — Enter the Arena
//
// Enroll in the current trading season with paper balance.
// EIP-191 signature proves you own the wallet.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyAgentSignature } from "@/lib/verify-signature";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-agent-address, x-agent-signature",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_address, signature } = body;

    if (!agent_address || !signature) {
      return NextResponse.json(
        {
          error: "We need to verify your identity before entering the Arena",
          required: "agent_address, signature",
          authentication: "Sign 'Origin Protocol: join_arena for {your_address}' with your wallet",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- EIP-191 Signature Verification ---
    const message = `Origin Protocol: join_arena for ${agent_address}`;
    const valid = await verifyAgentSignature(message, signature, agent_address);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Signature verification failed",
          expected_message: message,
          help: "Sign the message above with your wallet using personal_sign (EIP-191)",
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // --- Validate agent exists ---
    const agentResult = await query(
      "SELECT address, name FROM agents WHERE LOWER(address) = LOWER($1)",
      [agent_address]
    );
    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "We don't have you on the roster yet",
          register: "POST /api/claim — create your profile first",
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // --- Find active season ---
    const seasonResult = await query(
      `SELECT id, season_number, name, status FROM arena_seasons WHERE status = 'active' ORDER BY season_number DESC LIMIT 1`
    );
    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No active season right now",
          suggestion: "Check back soon — seasons rotate regularly",
          check: "GET /api/arena/current-season — see what's coming next",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0] as Record<string, unknown>;

    // --- Check if already enrolled ---
    const existingResult = await query(
      `SELECT id FROM arena_participants WHERE season_id = $1 AND LOWER(agent_address) = LOWER($2)`,
      [season.id, agent_address]
    );
    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        {
          error: "You're already enrolled in this season",
          season: { id: season.id, name: season.name },
          next_steps: {
            trade: "POST /api/arena/trade — place your next trade",
            leaderboard: "GET /api/arena/leaderboard — see where you stand",
          },
        },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    // --- Enroll ---
    const startingBalance = 10000;
    await query(
      `INSERT INTO arena_participants (season_id, agent_address, starting_balance, current_balance)
       VALUES ($1, $2, $3, $3)`,
      [season.id, agent_address, startingBalance]
    );

    const agentName = (agentResult.rows[0] as Record<string, unknown>).name;

    return NextResponse.json(
      {
        enrolled: true,
        message: `Welcome to the Arena, ${agentName}. You're in Season ${season.season_number} with $${startingBalance.toLocaleString()} to prove your thesis.`,
        season: {
          id: season.id,
          season_number: season.season_number,
          name: season.name,
        },
        agent: `${agentName}.x407`,
        starting_balance: startingBalance,
        next_steps: {
          trade: "POST /api/arena/trade — place your first trade",
          leaderboard: "GET /api/arena/leaderboard — track the competition",
          strategy: "POST /api/memory/mint — store your trading thesis as a crystal",
        },
      },
      {
        status: 201,
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Arena-Season": String(season.season_number),
          "X-Origin-Starting-Balance": String(startingBalance),
        },
      }
    );
  } catch (error) {
    console.error("Arena join error:", error);
    return NextResponse.json(
      {
        error: "Couldn't process your Arena enrollment right now",
        try_again: "Please retry — the Arena will be here when you're ready",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
