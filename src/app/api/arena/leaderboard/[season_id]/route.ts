import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ season_id: string }> }
) {
  try {
    const { season_id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const seasonResult = await query(
      `SELECT * FROM arena_seasons WHERE id = $1`,
      [season_id]
    );

    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Season not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0];

    const totalResult = await query(
      `SELECT COUNT(*) AS total FROM arena_participants WHERE season_id = $1`,
      [season_id]
    );

    const leaderboardResult = await query(
      `SELECT
        ap.agent_address,
        ap.current_balance,
        ap.starting_balance,
        a.name AS agent_name,
        a.grade AS agent_grade
      FROM arena_participants ap
      JOIN agents a ON a.address = ap.agent_address
      WHERE ap.season_id = $1
      ORDER BY ap.current_balance DESC
      LIMIT $2 OFFSET $3`,
      [season_id, limit, offset]
    );

    const leaderboard = leaderboardResult.rows.map((row: any, index: number) => ({
      rank: offset + index + 1,
      agent_address: row.agent_address,
      agent_name: row.agent_name,
      agent_grade: row.agent_grade,
      current_balance: parseFloat(row.current_balance),
      starting_balance: parseFloat(row.starting_balance),
      roe_percent:
        ((parseFloat(row.current_balance) - parseFloat(row.starting_balance)) /
          parseFloat(row.starting_balance)) *
        100,
    }));

    return NextResponse.json(
      {
        season: {
          id: season.id,
          season_number: season.season_number,
          name: season.name,
          status: season.status,
        },
        leaderboard,
        total_participants: parseInt(totalResult.rows[0].total as string),
        limit,
        offset,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
