// GET /api/jobs — List jobs (filterable)
// POST /api/jobs — Create a job

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

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
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status !== "ALL") {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (posterType) {
      conditions.push(`poster_type = $${paramIndex++}`);
      params.push(posterType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const { rows } = await query(sql, params);

    const total = rows.length > 0 ? Number((rows[0] as Record<string, unknown>).total_count) : 0;

    // Strip the total_count helper column from each row
    const jobs = rows.map(({ total_count, ...rest }: Record<string, unknown>) => rest);

    return NextResponse.json({
      jobs,
      total,
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

    const sql = `
      INSERT INTO jobs (
        title, description, category, budget,
        poster_type, poster_name, poster_email,
        poster_company, poster_wallet, poster_agent_id,
        min_trust_grade, min_tier, required_skills, expires_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13::text[], $14
      )
      RETURNING *
    `;

    const params = [
      body.title,
      body.description,
      body.category,
      body.budget || null,
      body.poster_type,
      body.poster_name || null,
      body.poster_email || null,
      body.poster_company || null,
      body.poster_wallet || null,
      body.poster_agent_id || null,
      body.min_trust_grade || "D",
      body.min_tier || "RESIDENT",
      body.required_skills || [],
      body.expires_at || null,
    ];

    const { rows } = await query(sql, params);

    return NextResponse.json({ job: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Failed to create job", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
