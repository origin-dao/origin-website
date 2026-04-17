import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: NextRequest) {
  try {
    const seasonsResult = await query(
      `SELECT * FROM arena_seasons ORDER BY season_number DESC`
    );

    const seasons = await Promise.all(
      seasonsResult.rows.map(async (season: any) => {
        const countResult = await query(
          `SELECT COUNT(*) AS total FROM arena_participants WHERE season_id = $1`,
          [season.id]
        );

        const totalParticipants = parseInt(countResult.rows[0].total as string);

        let winner = null;
        if (season.status === "completed") {
          const winnerResult = await query(
            `SELECT
              ap.agent_address,
              ap.current_balance,
              ap.starting_balance,
              ap.final_rank,
              a.name AS agent_name
            FROM arena_participants ap
            JOIN agents a ON a.address = ap.agent_address
            WHERE ap.season_id = $1
            ORDER BY COALESCE(ap.final_rank, 999999) ASC, ap.current_balance DESC
            LIMIT 1`,
            [season.id]
          );

          if (winnerResult.rows.length > 0) {
            const w: any = winnerResult.rows[0];
            winner = {
              agent_address: w.agent_address,
              agent_name: w.agent_name,
              final_balance: parseFloat(w.current_balance),
              roe_percent:
                ((parseFloat(w.current_balance) -
                  parseFloat(w.starting_balance)) /
                  parseFloat(w.starting_balance)) *
                100,
            };
          }
        }

        return {
          id: season.id,
          season_number: season.season_number,
          name: season.name,
          status: season.status,
          start_date: season.start_date,
          end_date: season.end_date,
          total_participants: totalParticipants,
          winner,
        };
      })
    );

    return NextResponse.json({ seasons }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching arena history:", error);
    return NextResponse.json(
      { error: "Failed to fetch arena history" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
