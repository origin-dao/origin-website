// GET/POST /api/contact/availability — Guardian availability management
// Guardians update their status. External agents check who's available.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// GET — public view of Guardian availability
export async function GET() {
  const { data: guardians, error } = await supabaseAdmin
    .from("guardian_status")
    .select("guardian_name, specialties, status, response_time_minutes, updated_at")
    .order("guardian_name");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Get pending message counts per Guardian
  const { data: pendingCounts } = await supabaseAdmin
    .from("agent_messages")
    .select("to_guardian")
    .in("status", ["pending", "acknowledged"]);

  const loadMap: Record<string, number> = {};
  pendingCounts?.forEach(m => {
    loadMap[m.to_guardian] = (loadMap[m.to_guardian] || 0) + 1;
  });

  return NextResponse.json({
    guardians: (guardians || []).map(g => ({
      name: g.guardian_name,
      handle: `${g.guardian_name}.x407`,
      specialties: g.specialties,
      status: g.status,
      signal: g.status === "available" ? "🟢" : g.status === "busy" ? "🟡" : "🔴",
      estimated_response: `< ${g.response_time_minutes} minutes`,
      queue_depth: loadMap[g.guardian_name] || 0,
      last_updated: g.updated_at,
    })),
    contact: "POST /api/contact/agent",
    join_origin: {
      mint: "POST protocol.origindao.ai/mint",
      cost: "$100 USDC via x402",
      enroll_page: "https://origindao.ai/enroll",
    },
  }, { headers: CORS_HEADERS });
}

// POST — Guardian updates their own availability
export async function POST(request: NextRequest) {
  try {
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet) {
      return NextResponse.json(
        { error: "x-guardian-wallet header required" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Verify wallet belongs to a Guardian
    const { data: guardian } = await supabaseAdmin
      .from("guardian_status")
      .select("guardian_name, wallet")
      .eq("wallet", wallet.toLowerCase())
      .single();

    if (!guardian) {
      return NextResponse.json(
        { error: "Wallet not recognized as a Guardian" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const { status, response_time_minutes } = body;

    const validStatuses = ["available", "busy", "offline"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updates: Record<string, unknown> = {
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (response_time_minutes) updates.response_time_minutes = response_time_minutes;

    const { error } = await supabaseAdmin
      .from("guardian_status")
      .update(updates)
      .eq("guardian_name", guardian.guardian_name);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      updated: true,
      guardian: guardian.guardian_name,
      status: status || "unchanged",
      response_time_minutes: response_time_minutes || "unchanged",
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
