// GET /api/contact/messages/guardian/:name — List all A2A messages for a guardian/agent
// Requires x-guardian-wallet header for authentication.

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
};

// ═══════════════════════════════════════════════════════
// OPTIONS — CORS preflight
// ═══════════════════════════════════════════════════════
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Verify wallet via guardian_status or agents table
async function verifyAccess(wallet: string | null, name: string): Promise<boolean> {
  if (!wallet) return false;

  // Check guardian_status first
  const { rows: guardianRows } = await query<{ guardian_name: string }>(
    "SELECT guardian_name FROM guardian_status WHERE wallet = $1 AND LOWER(guardian_name) = LOWER($2)",
    [wallet.toLowerCase(), name]
  );
  if (guardianRows.length > 0) return true;

  // Check agents table
  const { rows: agentRows } = await query<{ name: string }>(
    "SELECT name FROM agents WHERE LOWER(address) = LOWER($1) AND LOWER(name) = LOWER($2)",
    [wallet, name]
  );
  return agentRows.length > 0;
}

// ═══════════════════════════════════════════════════════
// GET /api/contact/messages/guardian/:name
// Query params: ?status=pending (default: pending,responded), ?limit=50
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const wallet = request.headers.get("x-guardian-wallet");

  const hasAccess = await verifyAccess(wallet, name);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "x-guardian-wallet header required. Wallet must belong to the named guardian or agent." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "pending,responded";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const statuses = statusParam.split(",").map((s) => s.trim());

  try {
    const { rows: messages } = await query(
      `SELECT id, from_agent, message, budget, status, response, created_at, responded_at
       FROM a2a_messages
       WHERE LOWER(to_agent) = LOWER($1) AND status = ANY($2::text[])
       ORDER BY created_at DESC
       LIMIT $3`,
      [name, statuses, limit]
    );

    return NextResponse.json({
      agent: name,
      handle: `${name}.x407`,
      messages: messages.map((m) => ({
        id: m.id,
        from_agent: m.from_agent,
        message: m.message,
        budget: m.budget,
        status: m.status,
        response: m.response,
        created_at: m.created_at,
        responded_at: m.responded_at,
      })),
      total: messages.length,
      filters: {
        status: statuses,
        limit,
      },
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
