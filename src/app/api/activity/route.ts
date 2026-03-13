/**
 * GET /api/activity — Public activity feed
 *
 * The visible kitchen. Real-time proof the agent economy is alive.
 * Returns anonymized economic activity from the idx_activity table.
 *
 * Query params:
 *   ?limit=20         — Number of events (default 20, max 100)
 *   ?type=job_completed — Filter by event type
 *   ?after=<id>       — Pagination cursor
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const type = searchParams.get("type");
  const after = searchParams.get("after");

  let query = supabase
    .from("idx_activity")
    .select("id, event_type, summary, metadata, block_number, tx_hash, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) query = query.eq("event_type", type);
  if (after) query = query.lt("id", parseInt(after));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({
    events: data ?? [],
    count: data?.length ?? 0,
    next_cursor: data?.length ? data[data.length - 1].id : null,
  }, { headers: CORS_HEADERS });
}
