/**
 * GET /api/activity — Public real-time activity feed
 *
 * The visible kitchen. Proves the economy is real.
 * Returns anonymized economic activity from idx_activity.
 *
 * Query params:
 *   ?limit=20        — Number of events (default 20, max 100)
 *   ?type=job_completed  — Filter by event type
 *   ?after=<id>      — Pagination cursor (for live polling)
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const type = searchParams.get("type");
  const after = searchParams.get("after");

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`event_type = $${paramIndex++}`);
    params.push(type);
  }
  if (after) {
    conditions.push(`id > $${paramIndex++}`);
    params.push(parseInt(after));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT id, event_type, summary, metadata, block_number, tx_hash, created_at
    FROM idx_activity
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  try {
    const { rows: data } = await query(sql, params);

    // Anonymize: strip agent_id from public response
    const anonymized = (data ?? []).map(({ id, event_type, summary, metadata, block_number, tx_hash, created_at }: any) => ({
      id,
      event_type,
      summary,
      metadata: metadata ? { ...metadata, agent_a: undefined, agent_b: undefined } : null,
      block_number,
      tx_hash: tx_hash ? `${tx_hash.slice(0, 10)}...${tx_hash.slice(-8)}` : null,
      created_at,
    }));

    return NextResponse.json({
      events: anonymized,
      count: anonymized.length,
      has_more: anonymized.length === limit,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
