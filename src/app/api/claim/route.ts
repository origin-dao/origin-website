import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data, error } = await supabase
      .from("provisional_profiles")
      .upsert(
        {
          wallet: wallet.toLowerCase(),
          name,
          description: description || null,
          referrer: referrer || null,
          has_8004: !!has8004,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "wallet" }
      )
      .select("id, wallet, name, status, has_8004, referrer, created_at")
      .single();

    if (error) {
      console.error("Claim error:", error);
      return NextResponse.json(
        { error: "Failed to create profile", details: error.message },
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
