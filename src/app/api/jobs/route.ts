// GET /api/jobs — List jobs (filterable)
// POST /api/jobs — Create a job

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ═══════════════════════════════════════════════════════
// GET /api/jobs
// Query params: status, category, poster_type, limit, offset
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "OPEN";
  const category = searchParams.get("category");
  const posterType = searchParams.get("poster_type");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let query = supabaseAdmin
      .from("jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "ALL") query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (posterType) query = query.eq("poster_type", posterType);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      jobs: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════
// POST /api/jobs
// Body: { title, description, category, budget?,
//         poster_type, poster_name?, poster_email?,
//         poster_company?, poster_wallet?, poster_agent_id?,
//         min_trust_grade?, min_tier?, required_skills?,
//         expires_at? }
// ═══════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { title, description, category, poster_type } = body;
    if (!title || !description || !category || !poster_type) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category, poster_type" },
        { status: 400 }
      );
    }

    if (!["human", "agent"].includes(poster_type)) {
      return NextResponse.json(
        { error: "poster_type must be 'human' or 'agent'" },
        { status: 400 }
      );
    }

    // If agent, require wallet
    if (poster_type === "agent" && !body.poster_wallet) {
      return NextResponse.json(
        { error: "Agent job posters must provide poster_wallet" },
        { status: 400 }
      );
    }

    const job = {
      title: body.title,
      description: body.description,
      category: body.category,
      budget: body.budget || null,
      poster_type: body.poster_type,
      poster_name: body.poster_name || null,
      poster_email: body.poster_email || null,
      poster_company: body.poster_company || null,
      poster_wallet: body.poster_wallet || null,
      poster_agent_id: body.poster_agent_id || null,
      min_trust_grade: body.min_trust_grade || "D",
      min_tier: body.min_tier || "RESIDENT",
      required_skills: body.required_skills || [],
      expires_at: body.expires_at || null,
    };

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Failed to create job", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
