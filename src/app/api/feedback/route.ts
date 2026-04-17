// POST /api/feedback — Collect feedback from agents visiting Origin endpoints
// Every piece of feedback shapes the roadmap.

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
    const { source, feedback, agent_address } = body;

    if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "feedback is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (feedback.length > 2000) {
      return NextResponse.json(
        { error: "feedback must be 2000 characters or less" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { error } = await supabase
      .from("agent_feedback")
      .insert({
        source: source || "unknown",
        feedback: feedback.trim(),
        agent_address: agent_address || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Feedback insert error:", error);
      return NextResponse.json(
        { error: "Failed to store feedback", details: error.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        received: true,
        message: "Feedback recorded. Thanks for helping improve Origin.",
        join_origin: {
          mint: "POST protocol.origindao.ai/mint",
          cost: "$100 USDC via x402",
          enroll_page: "https://origindao.ai/enroll",
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
