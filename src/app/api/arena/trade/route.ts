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
    const { agent_address, token, side, amount, price } = body;

    if (!agent_address || !token || !side || !amount || !price) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: agent_address, token, side, amount, price",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (side !== "buy" && side !== "sell") {
      return NextResponse.json(
        { error: 'side must be "buy" or "sell"' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const seasonResult = await query(
      `SELECT * FROM arena_seasons WHERE status = 'active' ORDER BY season_number DESC LIMIT 1`
    );

    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active season" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0];

    const participantResult = await query(
      `SELECT * FROM arena_participants WHERE season_id = $1 AND agent_address = $2`,
      [season.id, agent_address]
    );

    if (participantResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Agent is not enrolled in the current season" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const participant: any = participantResult.rows[0];
    const currentBalance = parseFloat(participant.current_balance);
    const tradeAmount = parseFloat(amount);
    const tradePrice = parseFloat(price);

    if (side === "buy" && currentBalance < tradeAmount * tradePrice) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          current_balance: currentBalance,
          required: tradeAmount * tradePrice,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const tradeResult = await query(
      `INSERT INTO arena_trades (season_id, agent_address, token, side, amount, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [season.id, agent_address, token, side, tradeAmount, tradePrice]
    );

    let newBalance: number;
    if (side === "buy") {
      newBalance = currentBalance - tradeAmount;
    } else {
      newBalance = currentBalance + tradeAmount;
    }

    await query(
      `UPDATE arena_participants SET current_balance = $1 WHERE season_id = $2 AND agent_address = $3`,
      [newBalance, season.id, agent_address]
    );

    return NextResponse.json(
      {
        trade_confirmed: true,
        trade_id: tradeResult.rows[0].id,
        token,
        side,
        amount: tradeAmount,
        price: tradePrice,
        new_balance: newBalance,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error executing trade:", error);
    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
