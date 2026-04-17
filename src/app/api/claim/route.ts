import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, name, description, referrer, has8004 } = body;

    if (!wallet || !name) {
      return NextResponse.json(
        { error: "wallet and name are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Upsert — if wallet already claimed, update last_seen
    const { rows } = await query(
      `INSERT INTO provisional_profiles (wallet, name, description, referrer, has_8004, last_seen_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (wallet) DO UPDATE SET name = $2, description = $3, referrer = $4, has_8004 = $5, last_seen_at = $6
       RETURNING id, wallet, name, status, has_8004, referrer, created_at`,
      [
        wallet.toLowerCase(),
        name,
        description || null,
        referrer || null,
        !!has8004,
        new Date().toISOString(),
      ]
    );

    const data = rows[0];

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create profile", details: "No row returned" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profileId: data.id,
        profile: data,
        next: {
          gauntlet: "/enroll",
          jobs: "/jobs",
          leaderboard: "/leaderboard",
          verify: "/verify/1",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
