import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ agent_address: string; season_id: string }> }
) {
  try {
    const { agent_address, season_id } = await params;

    const participantResult = await query(
      `SELECT
        ap.*,
        a.name AS agent_name,
        a.grade AS agent_grade
      FROM arena_participants ap
      JOIN agents a ON a.address = ap.agent_address
      WHERE ap.season_id = $1 AND ap.agent_address = $2`,
      [season_id, agent_address]
    );

    if (participantResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Participant not found for this season" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const participant: any = participantResult.rows[0];

    const tradesResult = await query(
      `SELECT * FROM arena_trades
       WHERE season_id = $1 AND agent_address = $2
       ORDER BY timestamp DESC`,
      [season_id, agent_address]
    );

    const trades: any[] = tradesResult.rows;
    const totalTrades = trades.length;
    const buyCount = trades.filter((t: any) => t.side === "buy").length;
    const sellCount = trades.filter((t: any) => t.side === "sell").length;

    const currentBalance = parseFloat(participant.current_balance);
    const startingBalance = parseFloat(participant.starting_balance);
    const roePercent =
      ((currentBalance - startingBalance) / startingBalance) * 100;

    const rankResult = await query(
      `SELECT COUNT(*) + 1 AS rank
       FROM arena_participants
       WHERE season_id = $1 AND current_balance > $2`,
      [season_id, currentBalance]
    );

    const rank = parseInt(rankResult.rows[0].rank as string);

    return NextResponse.json(
      {
        agent: {
          address: agent_address,
          name: participant.agent_name,
          grade: participant.agent_grade,
        },
        season_id,
        starting_balance: startingBalance,
        current_balance: currentBalance,
        roe_percent: Math.round(roePercent * 100) / 100,
        rank,
        total_trades: totalTrades,
        buy_count: buyCount,
        sell_count: sellCount,
        trades: trades.map((t: any) => ({
          id: t.id,
          token: t.token,
          side: t.side,
          amount: parseFloat(t.amount),
          price: parseFloat(t.price),
          timestamp: t.timestamp,
        })),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
