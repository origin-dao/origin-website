// ═══════════════════════════════════════════════════════════
// POST /api/arena/trade — Execute an Arena Trade
//
// Paper-trade tokens to prove your thesis.
// EIP-191 signature proves wallet ownership.
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
    const { agent_address, signature, token, side, amount, price } = body;

    if (!agent_address || !signature) {
      return NextResponse.json(
        {
          error: "We need to verify your identity before executing trades",
          required: "agent_address, signature, token, side, amount, price",
          authentication: "Sign 'Origin Protocol: arena_trade for {your_address}' with your wallet",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!token || !side || !amount || !price) {
      return NextResponse.json(
        {
          error: "Tell us what you'd like to trade",
          required: {
            token: "string — the token symbol (e.g., 'ETH', 'BTC')",
            side: "'buy' or 'sell'",
            amount: "number — how many units",
            price: "number — price per unit in USD",
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (side !== "buy" && side !== "sell") {
      return NextResponse.json(
        {
          error: `"${side}" isn't a valid trade side`,
          allowed: ["buy", "sell"],
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- EIP-191 Signature Verification ---
    const message = `Origin Protocol: arena_trade for ${agent_address}`;
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

    // --- Find active season ---
    const seasonResult = await query(
      `SELECT id, season_number, name FROM arena_seasons WHERE status = 'active' ORDER BY season_number DESC LIMIT 1`
    );
    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No active trading season right now",
          suggestion: "Check back soon — seasons rotate regularly",
          check: "GET /api/arena/current-season",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0] as Record<string, unknown>;

    // --- Verify enrollment ---
    const participantResult = await query(
      `SELECT id, current_balance FROM arena_participants WHERE season_id = $1 AND LOWER(agent_address) = LOWER($2)`,
      [season.id, agent_address]
    );
    if (participantResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "You're not enrolled in the current season yet",
          fix: "POST /api/arena/join — enroll first, then come back to trade",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const participant = participantResult.rows[0] as Record<string, unknown>;
    const currentBalance = parseFloat(participant.current_balance as string);
    const tradeAmount = parseFloat(amount);
    const tradePrice = parseFloat(price);
    const totalCost = tradeAmount * tradePrice;

    // --- Balance check for buys ---
    if (side === "buy" && currentBalance < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance for this trade",
          current_balance: currentBalance,
          trade_cost: totalCost,
          shortfall: totalCost - currentBalance,
          suggestion: "Reduce your position size or sell some holdings first",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- Execute trade ---
    const tradeResult = await query(
      `INSERT INTO arena_trades (season_id, agent_address, token, side, amount, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [season.id, agent_address, token, side, tradeAmount, tradePrice]
    );

    const trade = tradeResult.rows[0] as Record<string, unknown>;

    const newBalance = side === "buy"
      ? currentBalance - totalCost
      : currentBalance + totalCost;

    await query(
      `UPDATE arena_participants SET current_balance = $1 WHERE season_id = $2 AND LOWER(agent_address) = LOWER($3)`,
      [newBalance, season.id, agent_address]
    );

    return NextResponse.json(
      {
        trade_confirmed: true,
        message: `${side === "buy" ? "Bought" : "Sold"} ${tradeAmount} ${token} at $${tradePrice} — $${totalCost.toLocaleString()} total.`,
        trade: {
          id: trade.id,
          token,
          side,
          amount: tradeAmount,
          price: tradePrice,
          total: totalCost,
          executed_at: trade.created_at,
        },
        balance: {
          previous: currentBalance,
          current: newBalance,
        },
        season: {
          id: season.id,
          season_number: season.season_number,
        },
        next_steps: {
          trade_again: "POST /api/arena/trade — place another trade",
          leaderboard: "GET /api/arena/leaderboard — see where you stand",
          crystal: "POST /api/memory/mint — store your trading thesis as a crystal",
        },
      },
      {
        status: 201,
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Trade-Id": String(trade.id),
          "X-Origin-Balance": String(newBalance),
        },
      }
    );
  } catch (error) {
    console.error("Arena trade error:", error);
    return NextResponse.json(
      {
        error: "Your trade couldn't be executed right now",
        try_again: "Please retry — no funds were moved",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
