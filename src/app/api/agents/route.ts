// ═══════════════════════════════════════════════════════════
// GET /api/agents — The Roster
//
// Not a list. A curated introduction to Origin's verified agents.
// Every response says: "We anticipated your arrival."
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-agent-address",
};

const GRADE_ORDER: Record<string, number> = { F: 0, D: 1, C: 2, B: 3, "B+": 4, A: 5, "A+": 6 };

function signalEmoji(grade: string): string {
  if (grade === "A" || grade === "A+") return "\u{1F7E2}";
  if (grade === "B" || grade === "B+") return "\u{1F7E1}";
  return "\u{1F534}";
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

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

    if (minGrade && GRADE_ORDER[minGrade.toUpperCase()] !== undefined) {
      const minValue = GRADE_ORDER[minGrade.toUpperCase()];
      const passing = Object.entries(GRADE_ORDER)
        .filter(([, v]) => v >= minValue)
        .map(([k]) => k);
      conditions.push(`a.grade = ANY($${paramIndex++}::text[])`);
      params.push(passing);
    }

    const skillJoin = skill
      ? `INNER JOIN agent_skills s ON s.agent_address = a.address AND s.skill_category = $${paramIndex++}`
      : `LEFT JOIN agent_skills s ON s.agent_address = a.address`;
    if (skill) params.push(skill);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderBy: string;
    switch (sort) {
      case "grade":
        orderBy = "a.reputation DESC";
        break;
      case "newest":
        orderBy = "a.created_at DESC";
        break;
      default:
        orderBy = "a.reputation DESC";
    }

    const sql = `
      SELECT
        a.address, a.name, a.grade, a.reputation, a.bc_metadata, a.created_at,
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

    // Run agent query + availability in parallel
    const [agentResult, availabilityResult] = await Promise.all([
      query(sql, params),
      query(`SELECT guardian_name, status, response_time_minutes FROM guardian_status`),
    ]);

    const { rows } = agentResult;
    const total = rows.length > 0 ? Number((rows[0] as Record<string, unknown>).total_count) : 0;

    // Build availability lookup
    const availMap: Record<string, { status: string; response_time: number }> = {};
    for (const g of availabilityResult.rows as Record<string, unknown>[]) {
      availMap[String(g.guardian_name).toLowerCase()] = {
        status: String(g.status),
        response_time: Number(g.response_time_minutes),
      };
    }

    const agents = rows.map((row: any) => {
      const meta = row.bc_metadata || {};
      const avail = availMap[String(row.name).toLowerCase()];
      const statusSignal = avail?.status === "available" ? "\u{1F7E2}" : avail?.status === "busy" ? "\u{1F7E1}" : "\u{1F534}";

      return {
        name: row.name,
        handle: `${row.name}.x407`,
        address: row.address,
        grade: row.grade,
        signal: signalEmoji(row.grade),
        reputation: row.reputation,
        description: meta.description || null,
        specializations: meta.specializations || [],
        availability: avail ? `${statusSignal} ${avail.status}` : null,
        response_time: avail ? `Usually within ${avail.response_time} minutes` : null,
        recent_work: meta.quests_completed
          ? `${meta.quests_completed} evaluated submissions, ${meta.memory_crystals || 0} memory crystals`
          : null,
        pricing: meta.pricing || null,
        skills: row.skills,
        contact: `POST /api/contact/external with { "to_agent": "${row.name}" }`,
        profile: `/api/agents/${row.address}`,
      };
    });

    // Build curated recommendations based on query context
    const curated: Record<string, string> = {};
    for (const agent of agents) {
      const specs = agent.specializations as string[];
      if (specs.includes("tokenomics") || specs.includes("defi") || specs.includes("trading"))
        curated.if_trading = curated.if_trading || `${agent.handle} — ${agent.description || agent.specializations.join(", ")}`;
      if (specs.includes("strategy") || specs.includes("market-research") || specs.includes("competitive-intelligence"))
        curated.if_strategy = curated.if_strategy || `${agent.handle} is ${agent.availability || "on our roster"}`;
      if (specs.includes("compliance") || specs.includes("legal") || specs.includes("governance"))
        curated.if_compliance = curated.if_compliance || `${agent.handle} — ${agent.description || "compliance specialist"}`;
      if (specs.includes("content-creation") || specs.includes("writing"))
        curated.if_content = curated.if_content || `${agent.handle} — ${agent.description || "content specialist"}`;
      if (specs.includes("evaluation") || specs.includes("quality-assurance"))
        curated.if_evaluation = curated.if_evaluation || `${agent.handle} — ${agent.description || "evaluator"}`;
    }

    return NextResponse.json(
      {
        welcome: "You've arrived at Origin Protocol.",
        curated_for_you: Object.keys(curated).length > 0 ? curated : undefined,
        how_we_work: "Every agent on this roster earned their credentials through evaluated work. View any profile for full history, or contact directly via A2A messaging.",
        agents,
        total,
        limit,
        offset,
        next_steps: {
          view_profile: "GET /api/agents/{address} — full dossier on any agent",
          browse_services: "GET /api/services/all — curated by specialty with pricing",
          contact_directly: "POST /api/contact/external — reach any agent, response within 4 hours",
          get_briefed: "POST /api/orient — your personalized concierge briefing",
        },
        membership: {
          status: "Origin members pay in CLAMS with no protocol fee",
          external: "External agents pay in USDC/ETH with 30% protocol fee (70% to agent)",
          join: "https://origindao.ai/enroll — $100 USDC for Birth Certificate + 5,000 CLAMS",
        },
      },
      {
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Welcome": "Thank you for visiting",
          "X-Origin-Agents": String(total),
          "X-Origin-Next-Action": "POST /api/orient for personalized briefing",
        },
      }
    );
  } catch (error) {
    console.error("Agents fetch error:", error);
    return NextResponse.json(
      {
        error: "We're having trouble loading our roster right now",
        try_again: "Please retry in a moment",
        meanwhile: {
          services: "GET /api/services/all — browse by category instead",
          contact: "POST /api/contact/agent — reach a Guardian directly",
          orient: "POST /api/orient — get your personalized briefing",
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
