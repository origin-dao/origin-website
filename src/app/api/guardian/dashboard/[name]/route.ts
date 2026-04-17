// GET /api/guardian/dashboard/:name — Guardian's full dashboard
// Messages, stats, and pending work for a specific Guardian.

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

// Verify Guardian wallet and return guardian info
async function verifyGuardian(
  wallet: string | null,
  name: string
): Promise<{ guardian_name: string; status: string; specialties: string[] } | null> {
  if (!wallet) return null;
  const { rows } = await query<{ guardian_name: string; status: string; specialties: string[] }>(
    "SELECT guardian_name, status, specialties FROM guardian_status WHERE wallet = $1 AND guardian_name = $2",
    [wallet.toLowerCase(), name.toLowerCase()]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ═══════════════════════════════════════════════════════
// GET /api/guardian/dashboard/:name
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const wallet = request.headers.get("x-guardian-wallet");

  const guardian = await verifyGuardian(wallet, name);

  if (!guardian) {
    return NextResponse.json(
      { error: "x-guardian-wallet header required. Wallet must belong to the named Guardian." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    // Fetch pending guardian messages (agent_messages)
    const { rows: guardianMessages } = await query(
      `SELECT id, from_agent, from_address, message, budget_clams, category, priority, status, routed_by, created_at, acknowledged_at, responded_at
       FROM agent_messages
       WHERE to_guardian = $1 AND status IN ('pending', 'acknowledged')
       ORDER BY priority ASC, created_at ASC`,
      [guardian.guardian_name]
    );

    // Fetch pending A2A messages
    const { rows: a2aMessages } = await query(
      `SELECT id, from_agent, message, budget, status, created_at
       FROM a2a_messages
       WHERE LOWER(to_agent) = LOWER($1) AND status = 'pending'
       ORDER BY created_at ASC`,
      [guardian.guardian_name]
    );

    // Fetch response stats
    const { rows: statsRows } = await query<{
      total_messages: string;
      avg_response_minutes: string | null;
      responded_count: string;
      sla_met_count: string;
    }>(
      `SELECT
         COUNT(*)::text AS total_messages,
         ROUND(AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 60))::text AS avg_response_minutes,
         COUNT(*) FILTER (WHERE status = 'responded')::text AS responded_count,
         COUNT(*) FILTER (WHERE status = 'responded' AND responded_at - created_at <= INTERVAL '4 hours')::text AS sla_met_count
       FROM agent_messages
       WHERE to_guardian = $1`,
      [guardian.guardian_name]
    );

    const stats = statsRows[0];
    const totalMessages = parseInt(stats?.total_messages || "0");
    const respondedCount = parseInt(stats?.responded_count || "0");
    const slaMetCount = parseInt(stats?.sla_met_count || "0");
    const slaComplianceRate =
      respondedCount > 0
        ? Math.round((slaMetCount / respondedCount) * 100)
        : 100;

    return NextResponse.json({
      guardian: {
        name: guardian.guardian_name,
        handle: `${guardian.guardian_name}.x407`,
        status: guardian.status,
        specialties: guardian.specialties,
      },
      pending_guardian_messages: guardianMessages,
      pending_a2a_messages: a2aMessages,
      stats: {
        total_messages: totalMessages,
        avg_response_time_minutes: stats?.avg_response_minutes
          ? parseInt(stats.avg_response_minutes)
          : null,
        responded: respondedCount,
        sla_compliance_rate: `${slaComplianceRate}%`,
      },
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Guardian dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
