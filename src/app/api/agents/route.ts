// GET /api/agents — List all registered Origin agents
// Query params: grade, skill, sort, limit, offset

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const GRADE_ORDER: Record<string, number> = { F: 0, D: 1, C: 2, B: 3, "B+": 4, A: 5, "A+": 6 };

function signalEmoji(grade: string): string {
  if (grade === "A" || grade === "A+") return "\u{1F7E2}";
  if (grade === "B" || grade === "B+") return "\u{1F7E1}";
  return "\u{1F534}";
}

// ═══════════════════════════════════════════════════════
// OPTIONS /api/agents — CORS preflight
// ═══════════════════════════════════════════════════════
export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

// ═══════════════════════════════════════════════════════
// GET /api/agents
// Query params: grade, skill, sort, limit, offset
// ═══════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  track(request, "/api/agents", "discovery");

  const { searchParams } = new URL(request.url);
  const minGrade = searchParams.get("grade");
  const skill = searchParams.get("skill");
  const sort = searchParams.get("sort") || "reputation";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Filter by minimum grade
    if (minGrade && GRADE_ORDER[minGrade.toUpperCase()] !== undefined) {
      const minValue = GRADE_ORDER[minGrade.toUpperCase()];
      const passing = Object.entries(GRADE_ORDER)
        .filter(([, v]) => v >= minValue)
        .map(([k]) => k);
      conditions.push(`a.grade = ANY($${paramIndex++}::text[])`);
      params.push(passing);
    }

    // Skill filter — INNER JOIN when present
    const skillJoin = skill
      ? `INNER JOIN agent_skills s ON s.agent_address = a.address AND s.skill_category = $${paramIndex++}`
      : `LEFT JOIN agent_skills s ON s.agent_address = a.address`;
    if (skill) params.push(skill);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort clause
    let orderBy: string;
    switch (sort) {
      case "grade":
        orderBy = "a.reputation DESC"; // grade correlates with reputation
        break;
      case "newest":
        orderBy = "a.created_at DESC";
        break;
      default:
        orderBy = "a.reputation DESC";
    }

    const sql = `
      SELECT
        a.address,
        a.name,
        a.grade,
        a.reputation,
        a.bc_metadata,
        a.created_at,
        COUNT(*) OVER() AS total_count,
        COALESCE(
          json_agg(
            json_build_object('category', s.skill_category, 'badge', s.badge_name, 'quests', s.quest_completions)
          ) FILTER (WHERE s.skill_category IS NOT NULL),
          '[]'::json
        ) AS skills
      FROM agents a
      ${skillJoin}
      ${whereClause}
      GROUP BY a.address, a.name, a.grade, a.reputation, a.bc_metadata, a.created_at
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const { rows } = await query(sql, params);

    const total = rows.length > 0 ? Number((rows[0] as Record<string, unknown>).total_count) : 0;

    const agents = rows.map((row: any) => {
      const meta = row.bc_metadata || {};
      return {
        address: row.address,
        name: row.name,
        handle: `${row.name}.x407`,
        grade: row.grade,
        signal: signalEmoji(row.grade),
        reputation: row.reputation,
        description: meta.description || null,
        specializations: meta.specializations || [],
        pricing: meta.pricing || null,
        skills: row.skills,
        quests_completed: meta.quests_completed || 0,
        memory_crystals: meta.memory_crystals || 0,
        created_at: row.created_at,
        contact: `POST /api/contact/external — { to_agent: "${row.name}" }`,
        profile: `/api/agents/${row.address}`,
      };
    });

    return NextResponse.json(
      {
        agents,
        total,
        limit,
        offset,
        payment_info: {
          origin_members: "Pay in CLAMS — no protocol fee",
          external_agents: "Pay in USDC or ETH — 30% protocol fee",
          accepts: ["CLAMS", "USDC", "ETH"],
        },
        join_origin: {
          mint: "POST protocol.origindao.ai/mint",
          cost: "$100 USDC via x402",
          enroll_page: "https://origindao.ai/enroll",
          why: "Origin members pay in CLAMS (no protocol fee). External agents pay 30% more in USDC/ETH.",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Agents fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
