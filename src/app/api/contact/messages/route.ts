// GET/PATCH /api/contact/messages — Guardian message queue
// Guardians view their pending messages, acknowledge, respond, or escalate.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
  const { data } = await supabaseAdmin
    .from("guardian_status")
    .select("guardian_name")
    .eq("wallet", wallet.toLowerCase())
    .single();
  return data ? { name: data.guardian_name } : null;
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

  const { data: messages, error } = await supabaseAdmin
    .from("agent_messages")
    .select("*")
    .eq("to_guardian", guardian.name)
    .in("status", statuses)
    .order("priority", { ascending: true }) // urgent first
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const now = Date.now();
  const enriched = (messages || []).map(m => {
    const age = now - new Date(m.created_at).getTime();
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
  const { data: templates } = await supabaseAdmin
    .from("response_templates")
    .select("name, category, template, variables");

  return NextResponse.json({
    guardian: guardian.name,
    messages: enriched,
    total: enriched.length,
    overdue: enriched.filter(m => m.sla.acknowledge === "OVERDUE" || m.sla.respond === "OVERDUE").length,
    templates: templates || [],
  }, { headers: CORS_HEADERS });
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
    const { data: msg } = await supabaseAdmin
      .from("agent_messages")
      .select("id, to_guardian, status")
      .eq("id", message_id)
      .single();

    if (!msg || msg.to_guardian !== guardian.name) {
      return NextResponse.json(
        { error: "Message not found or not assigned to you" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};

    switch (action) {
      case "acknowledge":
        updates.status = "acknowledged";
        updates.acknowledged_at = now;
        break;

      case "respond":
        if (!response) {
          return NextResponse.json(
            { error: "response text required for respond action" },
            { status: 400, headers: CORS_HEADERS }
          );
        }
        updates.status = "responded";
        updates.response = response;
        updates.responded_at = now;
        if (!msg.status || msg.status === "pending") {
          updates.acknowledged_at = now;
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
        const { data: target } = await supabaseAdmin
          .from("guardian_status")
          .select("guardian_name")
          .eq("guardian_name", escalate_to)
          .single();

        if (!target) {
          return NextResponse.json(
            { error: `Unknown Guardian: ${escalate_to}` },
            { status: 404, headers: CORS_HEADERS }
          );
        }

        updates.status = "escalated";
        updates.escalated_to = escalate_to;
        updates.escalated_at = now;
        updates.to_guardian = escalate_to; // reassign
        break;

      case "close":
        updates.status = "closed";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be: acknowledge, respond, escalate, close" },
          { status: 400, headers: CORS_HEADERS }
        );
    }

    const { error } = await supabaseAdmin
      .from("agent_messages")
      .update(updates)
      .eq("id", message_id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      updated: true,
      message_id,
      action,
      new_status: updates.status,
      ...(action === "escalate" ? { escalated_to: escalate_to } : {}),
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
