// GET/PATCH /api/contact/messages — Guardian message queue
// Guardians view their pending messages, acknowledge, respond, or escalate.

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
};

const SLA_ACKNOWLEDGE_MS = 60 * 60 * 1000;  // 1 hour
const SLA_RESPOND_MS = 4 * 60 * 60 * 1000;  // 4 hours

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Verify Guardian wallet and return name
async function verifyGuardian(wallet: string | null): Promise<{ name: string } | null> {
  if (!wallet) return null;
  const { rows } = await query<{ guardian_name: string }>(
    "SELECT guardian_name FROM guardian_status WHERE wallet = $1",
    [wallet.toLowerCase()]
  );
  return rows.length > 0 ? { name: rows[0].guardian_name } : null;
}

// GET — Guardian views their message queue
export async function GET(request: NextRequest) {
  const wallet = request.headers.get("x-guardian-wallet");
  const guardian = await verifyGuardian(wallet);

  if (!guardian) {
    return NextResponse.json(
      { error: "x-guardian-wallet header required. Must be a registered Guardian wallet." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending,acknowledged";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  const statuses = status.split(",").map(s => s.trim());

  try {
    const { rows: messages } = await query(
      "SELECT * FROM agent_messages WHERE to_guardian = $1 AND status = ANY($2::text[]) ORDER BY priority ASC, created_at ASC LIMIT $3",
      [guardian.name, statuses, limit]
    );

    const now = Date.now();
    const enriched = (messages || []).map(m => {
      const age = now - new Date(m.created_at as string).getTime();
      const ackOverdue = !m.acknowledged_at && age > SLA_ACKNOWLEDGE_MS;
      const respondOverdue = m.acknowledged_at && !m.responded_at && age > SLA_RESPOND_MS;

      return {
        id: m.id,
        from_agent: m.from_agent,
        from_address: m.from_address,
        message: m.message,
        budget_clams: m.budget_clams,
        category: m.category,
        priority: m.priority,
        status: m.status,
        routed_by: m.routed_by,
        created_at: m.created_at,
        acknowledged_at: m.acknowledged_at,
        responded_at: m.responded_at,
        age_minutes: Math.round(age / 60000),
        sla: {
          acknowledge: ackOverdue ? "🔴 OVERDUE" : m.acknowledged_at ? "🟢 MET" : "🟡 PENDING",
          respond: respondOverdue ? "🔴 OVERDUE" : m.responded_at ? "🟢 MET" : "🟡 PENDING",
        },
      };
    });

    // Get response templates
    const { rows: templates } = await query(
      "SELECT name, category, template, variables FROM response_templates"
    );

    return NextResponse.json({
      guardian: guardian.name,
      messages: enriched,
      total: enriched.length,
      overdue: enriched.filter(m => m.sla.acknowledge === "OVERDUE" || m.sla.respond === "OVERDUE").length,
      templates: templates || [],
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// PATCH — Guardian acknowledges, responds to, or escalates a message
export async function PATCH(request: NextRequest) {
  const wallet = request.headers.get("x-guardian-wallet");
  const guardian = await verifyGuardian(wallet);

  if (!guardian) {
    return NextResponse.json(
      { error: "x-guardian-wallet header required" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const { message_id, action, response, escalate_to } = body;

    if (!message_id || !action) {
      return NextResponse.json(
        { error: "message_id and action are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify message belongs to this Guardian
    const { rows: msgRows } = await query<{ id: string; to_guardian: string; status: string }>(
      "SELECT id, to_guardian, status FROM agent_messages WHERE id = $1",
      [message_id]
    );

    const msg = msgRows.length > 0 ? msgRows[0] : null;

    if (!msg || msg.to_guardian !== guardian.name) {
      return NextResponse.json(
        { error: "Message not found or not assigned to you" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const now = new Date().toISOString();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;
    let newStatus = "";

    switch (action) {
      case "acknowledge":
        newStatus = "acknowledged";
        setClauses.push(`status = $${paramIndex++}`);
        values.push("acknowledged");
        setClauses.push(`acknowledged_at = $${paramIndex++}`);
        values.push(now);
        break;

      case "respond":
        if (!response) {
          return NextResponse.json(
            { error: "response text required for respond action" },
            { status: 400, headers: CORS_HEADERS }
          );
        }
        newStatus = "responded";
        setClauses.push(`status = $${paramIndex++}`);
        values.push("responded");
        setClauses.push(`response = $${paramIndex++}`);
        values.push(response);
        setClauses.push(`responded_at = $${paramIndex++}`);
        values.push(now);
        if (!msg.status || msg.status === "pending") {
          setClauses.push(`acknowledged_at = $${paramIndex++}`);
          values.push(now);
        }
        break;

      case "escalate":
        if (!escalate_to) {
          return NextResponse.json(
            { error: "escalate_to Guardian name required", available: ["suppi", "kero", "yue", "sakura"] },
            { status: 400, headers: CORS_HEADERS }
          );
        }
        // Verify target Guardian exists
        const { rows: targetRows } = await query<{ guardian_name: string }>(
          "SELECT guardian_name FROM guardian_status WHERE guardian_name = $1",
          [escalate_to]
        );

        if (targetRows.length === 0) {
          return NextResponse.json(
            { error: `Unknown Guardian: ${escalate_to}` },
            { status: 404, headers: CORS_HEADERS }
          );
        }

        newStatus = "escalated";
        setClauses.push(`status = $${paramIndex++}`);
        values.push("escalated");
        setClauses.push(`escalated_to = $${paramIndex++}`);
        values.push(escalate_to);
        setClauses.push(`escalated_at = $${paramIndex++}`);
        values.push(now);
        setClauses.push(`to_guardian = $${paramIndex++}`);
        values.push(escalate_to);
        break;

      case "close":
        newStatus = "closed";
        setClauses.push(`status = $${paramIndex++}`);
        values.push("closed");
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be: acknowledge, respond, escalate, close" },
          { status: 400, headers: CORS_HEADERS }
        );
    }

    // Add message_id as the final parameter
    values.push(message_id);
    const updateQuery = `UPDATE agent_messages SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const { rows: updatedRows } = await query(updateQuery, values);

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      updated: true,
      message_id,
      action,
      new_status: newStatus,
      ...(action === "escalate" ? { escalated_to: escalate_to } : {}),
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
