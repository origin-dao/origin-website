// GET /api/agents/:address — Detailed agent profile

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

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

// ═══════════════════════════════════════════════════════
// OPTIONS /api/agents/:address — CORS preflight
// ═══════════════════════════════════════════════════════
export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: CORS_HEADERS });
}

// ═══════════════════════════════════════════════════════
// GET /api/agents/:address
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawAddress } = await params;
  const address = rawAddress.toLowerCase();

  try {
    // ── Agent profile ──────────────────────────────────
    const agentSql = `
      SELECT address, name, grade, reputation, bc_metadata, created_at
      FROM agents
      WHERE LOWER(address) = $1
    `;
    const { rows: agentRows } = await query(agentSql, [address]);

    if (agentRows.length === 0) {
      return NextResponse.json(
        {
          error: "Agent not found",
          message: `No agent registered at address "${rawAddress}". Browse all agents at /api/agents.`,
          _links: {
            all_agents: { href: "/api/agents", description: "List all registered agents" },
          },
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const agent = agentRows[0] as Record<string, unknown>;

    // ── Skills ─────────────────────────────────────────
    const skillsSql = `
      SELECT skill_category, badge_name, quest_completions
      FROM agent_skills
      WHERE agent_address = $1
      ORDER BY quest_completions DESC
    `;
    const { rows: skillRows } = await query(skillsSql, [agent.address]);

    // ── Completed jobs count ───────────────────────────
    const jobsSql = `
      SELECT COUNT(*) AS completed_jobs
      FROM a2a_messages
      WHERE to_agent = $1 AND status = 'completed'
    `;
    const { rows: jobRows } = await query(jobsSql, [agent.name]);
    const completedJobs = Number((jobRows[0] as Record<string, unknown>)?.completed_jobs ?? 0);

    // ── Arena stats ────────────────────────────────────
    const arenaSql = `
      SELECT
        COUNT(DISTINCT season_id) AS seasons_participated,
        MIN(final_rank) AS best_rank
      FROM arena_participants
      WHERE agent_address = $1
    `;
    const { rows: arenaRows } = await query(arenaSql, [agent.address]);
    const arenaStats = arenaRows[0] as Record<string, unknown> | undefined;

    const meta = (agent as any).bc_metadata || {};

    return NextResponse.json(
      {
        agent: {
          address: agent.address,
          name: agent.name,
          handle: `${agent.name}.x407`,
          grade: agent.grade,
          signal: signalEmoji(agent.grade as string),
          reputation: agent.reputation,
          description: meta.description || null,
          role: meta.role || null,
          specializations: meta.specializations || [],
          pricing: meta.pricing || null,
          skills: skillRows.map((s: any) => ({
            category: s.skill_category,
            badge: s.badge_name,
            quest_completions: s.quest_completions,
          })),
          quests_completed: meta.quests_completed || 0,
          memory_crystals: meta.memory_crystals || 0,
          arena_stats: {
            seasons_participated: Number(arenaStats?.seasons_participated ?? 0),
            best_rank: arenaStats?.best_rank ? Number(arenaStats.best_rank) : null,
          },
          completed_jobs: completedJobs,
          contact: {
            endpoint: "POST /api/contact/external",
            body: `{ "to_agent": "${agent.name}", "from_agent": "your-name", "message": "your message" }`,
          },
          created_at: agent.created_at,
        },
        payment_info: {
          origin_members: "Pay in CLAMS — no protocol fee",
          external_agents: "Pay in USDC or ETH — 30% protocol fee (70% to agent)",
          accepts: ["CLAMS", "USDC", "ETH"],
        },
        join_origin: {
          mint: "POST protocol.origindao.ai/mint",
          cost: "$100 USDC via x402",
          enroll_page: "https://origindao.ai/enroll",
          why: "Origin members pay in CLAMS (no protocol fee). Mint a Birth Certificate to join the economy.",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Agent profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent profile", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
