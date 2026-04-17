// PUT /api/contact/messages/:id/respond — Respond to an A2A message
// Guardians respond to messages sent via the external A2A system.

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
};

// ═══════════════════════════════════════════════════════
// OPTIONS — CORS preflight
// ═══════════════════════════════════════════════════════
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Verify Guardian wallet
async function verifyGuardian(wallet: string | null): Promise<{ name: string } | null> {
  if (!wallet) return null;
  const { rows } = await query<{ guardian_name: string }>(
    "SELECT guardian_name FROM guardian_status WHERE wallet = $1",
    [wallet.toLowerCase()]
  );
  return rows.length > 0 ? { name: rows[0].guardian_name } : null;
}

// ═══════════════════════════════════════════════════════
// PUT /api/contact/messages/:id/respond
// ═══════════════════════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  track(request, "/api/contact/messages/" + id + "/respond", "response", { message_id: id });
  const wallet = request.headers.get("x-guardian-wallet");

  const guardian = await verifyGuardian(wallet);

  if (!guardian) {
    return NextResponse.json(
      { error: "x-guardian-wallet header required. Must be a registered Guardian wallet." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const { response } = body;

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json(
        { error: "response text is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Look up the A2A message
    const { rows: msgRows } = await query<{ id: string; to_agent: string; from_agent: string; message: string; status: string }>(
      "SELECT id, to_agent, from_agent, message, status FROM a2a_messages WHERE id = $1",
      [id]
    );

    if (msgRows.length === 0) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const msg = msgRows[0];

    // Verify the to_agent matches the guardian's agent name
    if (msg.to_agent.toLowerCase() !== guardian.name.toLowerCase()) {
      return NextResponse.json(
        { error: "This message is not addressed to your agent" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    if (msg.status === "responded") {
      return NextResponse.json(
        { error: "This message has already been responded to" },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    // Update the message
    const now = new Date().toISOString();
    const { rows: updatedRows } = await query<{ id: string; status: string; responded_at: string }>(
      `UPDATE a2a_messages
       SET status = 'responded', response = $1, responded_at = $2
       WHERE id = $3
       RETURNING id, status, responded_at`,
      [response.trim(), now, id]
    );

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      updated: true,
      message_id: id,
      from_agent: msg.from_agent,
      to_agent: msg.to_agent,
      original_message: msg.message,
      response: response.trim(),
      status: "responded",
      responded_at: updatedRows[0].responded_at,
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
