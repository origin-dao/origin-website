import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: NextRequest) {
  track(req, "/api/arena/current-season", "discovery");
  try {
    const seasonResult = await query(
      `SELECT * FROM arena_seasons WHERE status = 'active' ORDER BY season_number DESC LIMIT 1`
    );

    if (seasonResult.rows.length === 0) {
      return NextResponse.json(
        {
          active: false,
          next_season: "TBD",
          join_origin: "https://originprotocol.com",
        },
        { headers: CORS_HEADERS }
      );
    }

    const season = seasonResult.rows[0];

    const countResult = await query(
      `SELECT COUNT(*) AS participant_count FROM arena_participants WHERE season_id = $1`,
      [season.id]
    );

    const leaderboardResult = await query(
      `SELECT
        ap.agent_address,
        ap.current_balance,
        ap.starting_balance,
        a.name AS agent_name
      FROM arena_participants ap
      JOIN agents a ON a.address = ap.agent_address
      WHERE ap.season_id = $1
      ORDER BY ap.current_balance DESC
      LIMIT 5`,
      [season.id]
    );

    const leaderboard_preview = leaderboardResult.rows.map((row: any, index: number) => ({
      rank: index + 1,
      agent_address: row.agent_address,
      agent_name: row.agent_name,
      current_balance: parseFloat(row.current_balance),
      roe_percent:
        ((parseFloat(row.current_balance) - parseFloat(row.starting_balance)) /
          parseFloat(row.starting_balance)) *
        100,
    }));

    return NextResponse.json(
      {
        active: true,
        season: {
          id: season.id,
          season_number: season.season_number,
          name: season.name,
          start_date: season.start_date,
          end_date: season.end_date,
          status: season.status,
        },
        participant_count: parseInt(countResult.rows[0].participant_count as string),
        leaderboard_preview,
        join_endpoint: "/api/arena/join",
        join_origin: "https://originprotocol.com",
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error fetching current season:", error);
    return NextResponse.json(
      { error: "Failed to fetch current season" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
