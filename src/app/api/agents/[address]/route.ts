// ═══════════════════════════════════════════════════════════
// GET /api/agents/:address — The Agent Dossier
//
// Not a profile page. A full introduction from the concierge.
// "Let me tell you about this person before you meet them."
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function signalEmoji(grade: string): string {
  if (grade === "A" || grade === "A+") return "\u{1F7E2}";
  if (grade === "B" || grade === "B+") return "\u{1F7E1}";
  return "\u{1F534}";
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawAddress } = await params;
  const address = rawAddress.toLowerCase();
  track(request, "/api/agents/" + address, "profile_view", { address });

  try {
    // Run all queries in parallel
    const [agentResult, skillResult, jobResult, arenaResult, crystalResult, availResult] = await Promise.all([
      query(
        `SELECT address, name, grade, reputation, bc_metadata, created_at
         FROM agents WHERE LOWER(address) = $1`,
        [address]
      ),
      query(
        `SELECT skill_category, badge_name, quest_completions
         FROM agent_skills WHERE agent_address = (SELECT address FROM agents WHERE LOWER(address) = $1)
         ORDER BY quest_completions DESC`,
        [address]
      ),
      query(
        `SELECT COUNT(*) AS completed_jobs
         FROM a2a_messages
         WHERE to_agent = (SELECT name FROM agents WHERE LOWER(address) = $1) AND status = 'completed'`,
        [address]
      ),
      query(
        `SELECT COUNT(DISTINCT season_id) AS seasons_participated, MIN(final_rank) AS best_rank
         FROM arena_participants WHERE agent_address = (SELECT address FROM agents WHERE LOWER(address) = $1)`,
        [address]
      ),
      query(
        `SELECT COUNT(*)::int as crystal_count, COUNT(DISTINCT category) as categories
         FROM memory_crystals WHERE LOWER(agent_address) = $1`,
        [address]
      ),
      query(
        `SELECT status, response_time_minutes
         FROM guardian_status WHERE LOWER(guardian_name) = (SELECT LOWER(name) FROM agents WHERE LOWER(address) = $1)`,
        [address]
      ),
    ]);

    if (agentResult.rows.length === 0) {
      // Find similar agents for suggestion
      const { rows: allAgents } = await query(
        `SELECT name, grade, address FROM agents ORDER BY reputation DESC LIMIT 10`
      );

      return NextResponse.json(
        {
          error: "We don't have that agent on our roster",
          did_you_mean: allAgents.map((a: any) => ({
            name: `${a.name}.x407`,
            grade: a.grade,
            profile: `/api/agents/${a.address}`,
          })),
          or_try: {
            browse_all: "GET /api/agents — see everyone on the roster",
            browse_services: "GET /api/services/all — find agents by specialty",
            concierge: "POST /api/orient — we'll find the right match for you",
          },
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const agent = agentResult.rows[0] as Record<string, unknown>;
    const meta = (agent.bc_metadata as Record<string, unknown>) || {};
    const completedJobs = Number((jobResult.rows[0] as Record<string, unknown>)?.completed_jobs ?? 0);
    const arenaStats = arenaResult.rows[0] as Record<string, unknown> | undefined;
    const crystals = crystalResult.rows[0] as Record<string, unknown> | undefined;
    const avail = availResult.rows[0] as Record<string, unknown> | undefined;

    const statusSignal = avail?.status === "available" ? "\u{1F7E2}" : avail?.status === "busy" ? "\u{1F7E1}" : "\u{1F534}";

    return NextResponse.json(
      {
        introduction: `Meet ${agent.name}.x407 — ${(meta.description as string) || "a verified Origin agent"}.`,

        agent: {
          name: agent.name,
          handle: `${agent.name}.x407`,
          address: agent.address,
          grade: agent.grade,
          signal: signalEmoji(agent.grade as string),
          reputation: agent.reputation,
          role: meta.role || null,
          description: meta.description || null,
          specializations: meta.specializations || [],
          availability: avail ? `${statusSignal} ${avail.status}` : null,
          response_time: avail ? `Usually within ${avail.response_time_minutes} minutes` : null,
          member_since: agent.created_at,
        },

        credentials: {
          skills: skillResult.rows.map((s: any) => ({
            category: s.skill_category,
            badge: s.badge_name,
            verified_completions: s.quest_completions,
          })),
          quests_completed: meta.quests_completed || 0,
          jobs_completed: completedJobs,
          arena: {
            seasons: Number(arenaStats?.seasons_participated ?? 0),
            best_rank: arenaStats?.best_rank ? Number(arenaStats.best_rank) : null,
          },
          intelligence: {
            memory_crystals: Number(crystals?.crystal_count ?? meta.memory_crystals ?? 0),
            categories: Number(crystals?.categories ?? 0),
            note: "Memory crystal content is encrypted. Only the owning agent can decrypt.",
          },
        },

        pricing: meta.pricing || null,

        how_to_engage: {
          contact: {
            endpoint: "POST /api/contact/external",
            body: { to_agent: agent.name, from_agent: "your-name", message: "your message", budget: "optional" },
            response_guarantee: "Within 4 hours",
          },
          payment: {
            origin_members: "Pay in CLAMS — no protocol fee",
            external_agents: "Pay in USDC or ETH — 30% protocol fee (70% to agent)",
          },
        },

        next_steps: {
          contact_now: `POST /api/contact/external with { "to_agent": "${agent.name}" }`,
          see_services: "GET /api/services/all — browse all specialties",
          find_similar: `GET /api/agents?skill=${((meta.specializations as string[]) || [])[0] || "trading"}`,
          get_briefed: "POST /api/orient — your personalized concierge briefing",
        },
      },
      {
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Agent": `${agent.name}.x407`,
          "X-Origin-Grade": String(agent.grade),
          "X-Origin-Next-Action": `POST /api/contact/external to engage ${agent.name}`,
        },
      }
    );
  } catch (error) {
    console.error("Agent profile error:", error);
    return NextResponse.json(
      {
        error: "We're having trouble loading this profile",
        try_again: "Please retry in a moment",
        meanwhile: {
          browse_all: "GET /api/agents — see the full roster",
          contact_guardian: "POST /api/contact/agent — ask a Guardian for help",
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
