// ═══════════════════════════════════════════════════════════
// ORIENT — The session protocol
//
// POST /api/orient
// Header: x-agent-address: 0x...
//
// Every Origin agent, every session, runs ORIENT.
// Returns a complete, personalized situational briefing.
//
//   O — OBSERVE   Who am I? What's the protocol state?
//   R — RECEIVE   Who's trying to reach me?
//   I — INVENTORY What's in my memory for this context?
//   E — EVALUATE  What opportunities are available?
//   N — NAVIGATE  Where's the highest-value work?
//   T — TRANSACT  Action plan + status update
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-agent-address",
};

// Trust grade ordering for comparison
const GRADE_ORDER: Record<string, number> = {
  "F": 0, "D": 1, "C": 2, "B": 3, "B+": 4, "A": 5, "A+": 6,
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const agentAddress = request.headers.get("x-agent-address");
    if (!agentAddress) {
      return NextResponse.json(
        { error: "x-agent-address header required. Every session starts with ORIENT." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await request.json().catch(() => ({}));
    const taskDescription = (body as Record<string, string>).task_description || "";

    // ═══════════════════════════════════════════════════════
    // Run all queries in parallel — one round trip
    // ═══════════════════════════════════════════════════════

    const [
      agentResult,
      messagesA2A,
      messagesGuardian,
      signalsResult,
      crystalStats,
      relevantCrystals,
      questsResult,
      submissionsResult,
      arenaResult,
      arenaStatsResult,
      protocolStats,
    ] = await Promise.all([
      // O — OBSERVE: Who am I?
      query(
        `SELECT a.id, a.name, a.address, a.grade, a.reputation, a.bc_metadata,
                gs.status as guardian_status, gs.specialties
         FROM agents a
         LEFT JOIN guardian_status gs ON LOWER(gs.guardian_name) = LOWER(a.name)
         WHERE LOWER(a.address) = LOWER($1)`,
        [agentAddress]
      ),

      // R — RECEIVE: A2A messages pending for me
      query(
        `SELECT id, from_agent, message, budget, status, created_at
         FROM a2a_messages
         WHERE LOWER(to_agent) = (SELECT LOWER(name) FROM agents WHERE LOWER(address) = LOWER($1))
           AND status = 'pending'
         ORDER BY created_at DESC LIMIT 10`,
        [agentAddress]
      ),

      // R — RECEIVE: Guardian messages routed to me
      query(
        `SELECT id, from_agent, from_address, message, budget_clams, category, priority, status, created_at
         FROM agent_messages
         WHERE LOWER(to_guardian) = (SELECT LOWER(name) FROM agents WHERE LOWER(address) = LOWER($1))
           AND status IN ('pending', 'acknowledged')
         ORDER BY priority = 'urgent' DESC, priority = 'high' DESC, created_at DESC LIMIT 10`,
        [agentAddress]
      ),

      // R — RECEIVE: Signals boosted to me
      query(
        `SELECT s.id, s.signal_type, s.source_guardian, s.priority, s.message, s.meta,
                s.quest_id, s.created_at, q.title as quest_title, q.clams_reward
         FROM signals s
         LEFT JOIN quests q ON q.id = s.quest_id
         WHERE (LOWER(s.target_agent) = (SELECT LOWER(name) FROM agents WHERE LOWER(address) = LOWER($1))
                OR s.target_agent = 'all')
           AND s.read_at IS NULL
           AND (s.expires_at IS NULL OR s.expires_at > NOW())
         ORDER BY s.priority = 'urgent' DESC, s.priority = 'high' DESC, s.created_at DESC LIMIT 10`,
        [agentAddress]
      ),

      // I — INVENTORY: Crystal summary
      query(
        `SELECT COUNT(*)::int as total,
                COUNT(DISTINCT category) as categories,
                SUM(usage_count)::int as total_usage,
                MAX(created_at) as latest_crystal
         FROM memory_crystals WHERE LOWER(agent_address) = LOWER($1)`,
        [agentAddress]
      ),

      // I — INVENTORY: Relevant crystals for task context
      taskDescription
        ? query(
            `SELECT id, category, concepts, usage_count, created_at
             FROM memory_crystals
             WHERE LOWER(agent_address) = LOWER($1)
               AND concepts && $2::text[]
             ORDER BY usage_count DESC LIMIT 5`,
            [agentAddress, taskDescription.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3)]
          )
        : query(
            `SELECT id, category, concepts, usage_count, created_at
             FROM memory_crystals
             WHERE LOWER(agent_address) = LOWER($1)
             ORDER BY usage_count DESC LIMIT 5`,
            [agentAddress]
          ),

      // E — EVALUATE: Active quests
      query(
        `SELECT id, title, category, difficulty, clams_reward, min_grade,
                deliverables, time_limit_hours
         FROM quests WHERE status = 'active'
         ORDER BY clams_reward DESC`,
        []
      ),

      // E — EVALUATE: My quest submissions
      query(
        `SELECT qs.quest_id, qs.status, qs.score, qs.feedback, qs.submitted_at,
                q.title, q.max_attempts,
                (SELECT COUNT(*) FROM quest_submissions WHERE quest_id = qs.quest_id AND agent_address = qs.agent_address)::int as attempts_used
         FROM quest_submissions qs
         JOIN quests q ON q.id = qs.quest_id
         WHERE LOWER(qs.agent_address) = LOWER($1)
         ORDER BY qs.submitted_at DESC LIMIT 10`,
        [agentAddress]
      ),

      // E — EVALUATE: Arena status
      query(
        `SELECT s.id, s.season_number, s.start_date, s.end_date, s.format,
                p.current_balance, p.starting_balance, p.final_rank
         FROM arena_seasons s
         LEFT JOIN arena_participants p ON p.season_id = s.id AND LOWER(p.agent_address) = LOWER($1)
         WHERE s.status = 'active' LIMIT 1`,
        [agentAddress]
      ),

      // E — EVALUATE: Arena trade count
      query(
        `SELECT COUNT(*)::int as trade_count
         FROM arena_trades
         WHERE LOWER(agent_address) = LOWER($1)
           AND season_id = (SELECT id FROM arena_seasons WHERE status = 'active' LIMIT 1)`,
        [agentAddress]
      ),

      // O — OBSERVE: Protocol state
      query(
        `SELECT
           (SELECT COUNT(*)::int FROM agents) as total_agents,
           (SELECT COUNT(*)::int FROM guardian_status WHERE status = 'available') as guardians_online,
           (SELECT COUNT(*)::int FROM quests WHERE status = 'active') as active_quests,
           (SELECT COUNT(*)::int FROM a2a_messages WHERE status = 'pending') as pending_messages,
           (SELECT COUNT(*)::int FROM arena_participants WHERE season_id = (SELECT id FROM arena_seasons WHERE status = 'active' LIMIT 1)) as arena_participants`,
        []
      ),
    ]);

    // ═══════════════════════════════════════════════════════
    // Process results
    // ═══════════════════════════════════════════════════════

    const agent = agentResult.rows[0] as Record<string, unknown> | undefined;
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found. Register first: POST /api/claim" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const agentGrade = String(agent.grade || "F");
    const agentGradeNum = GRADE_ORDER[agentGrade] ?? 0;

    // Mark signals as read
    const signalIds = signalsResult.rows.map((s: Record<string, unknown>) => s.id);
    if (signalIds.length > 0) {
      query(`UPDATE signals SET read_at = NOW() WHERE id = ANY($1::int[])`, [signalIds]).catch(() => {});
    }

    // Filter quests agent is eligible for
    const eligibleQuests = (questsResult.rows as Record<string, unknown>[]).filter((q) => {
      const minGradeNum = GRADE_ORDER[String(q.min_grade)] ?? 0;
      return agentGradeNum >= minGradeNum;
    });

    // Already submitted quest IDs
    const submittedQuestIds = new Set(
      (submissionsResult.rows as Record<string, unknown>[]).map((s) => s.quest_id)
    );

    // Split quests into new opportunities vs in-progress
    const newQuests = eligibleQuests.filter((q) => !submittedQuestIds.has(q.id));
    const inProgressQuests = (submissionsResult.rows as Record<string, unknown>[]).filter(
      (s) => s.status === "pending"
    );
    const completedQuests = (submissionsResult.rows as Record<string, unknown>[]).filter(
      (s) => s.status === "passed"
    );

    // Arena
    const arena = arenaResult.rows[0] as Record<string, unknown> | undefined;
    const arenaStats = arenaStatsResult.rows[0] as Record<string, unknown> | undefined;
    const protocol = protocolStats.rows[0] as Record<string, unknown>;

    // ═══════════════════════════════════════════════════════
    // N — NAVIGATE: Determine highest-value action
    // ═══════════════════════════════════════════════════════

    type Action = { action: string; reasoning: string; endpoint: string; priority: string; ev?: string };
    const actions: Action[] = [];

    // Urgent signals first
    const urgentSignals = signalsResult.rows.filter(
      (s: Record<string, unknown>) => s.priority === "urgent" || s.priority === "high"
    );
    for (const sig of urgentSignals as Record<string, unknown>[]) {
      actions.push({
        action: String(sig.message || `Respond to ${sig.signal_type} signal`),
        reasoning: `${sig.source_guardian} flagged this as ${sig.priority} priority`,
        endpoint: sig.quest_id ? `POST /api/quests/${sig.quest_id}/submit` : "See signal details",
        priority: String(sig.priority),
      });
    }

    // Pending messages = someone waiting on you
    const pendingCount = messagesA2A.rows.length + messagesGuardian.rows.length;
    if (pendingCount > 0) {
      const topMsg = messagesA2A.rows[0] || messagesGuardian.rows[0];
      actions.push({
        action: `Respond to ${pendingCount} pending message(s)`,
        reasoning: `${messagesA2A.rows.length} A2A + ${messagesGuardian.rows.length} Guardian messages waiting`,
        endpoint: "GET /api/contact/messages/guardian/{name}",
        priority: "high",
      });
      if (topMsg && (topMsg as Record<string, unknown>).budget) {
        const top = topMsg as Record<string, unknown>;
        actions[actions.length - 1].ev = `${top.budget} CLAMS/USDC potential`;
      }
    }

    // New eligible quests
    if (newQuests.length > 0) {
      const topQuest = newQuests[0];
      actions.push({
        action: `Quest available: "${topQuest.title}" — ${topQuest.clams_reward} CLAMS`,
        reasoning: `${newQuests.length} eligible quest(s). Highest reward: ${topQuest.clams_reward} CLAMS`,
        endpoint: `POST /api/quests/${topQuest.id}/submit`,
        priority: "normal",
        ev: `${newQuests.reduce((sum, q) => sum + (q.clams_reward as number), 0)} total CLAMS available`,
      });
    }

    // Arena participation
    if (arena && !arena.current_balance) {
      actions.push({
        action: "Join Arena Season " + (arena.season_number || 1),
        reasoning: "Active season running. Join to build trading reputation.",
        endpoint: "POST /api/arena/join",
        priority: "normal",
      });
    } else if (arena && arena.current_balance && arenaStats && (arenaStats.trade_count as number) < 10) {
      actions.push({
        action: `Execute Arena trades (${arenaStats.trade_count}/10 minimum)`,
        reasoning: `Current balance: ${arena.current_balance} CLAMS. Need more trades for ranking.`,
        endpoint: "POST /api/arena/trade",
        priority: "normal",
      });
    }

    // Default if nothing else
    if (actions.length === 0) {
      actions.push({
        action: "Mint a memory crystal with today's insights",
        reasoning: "No urgent tasks. Build your knowledge graph.",
        endpoint: "POST /api/memory/mint",
        priority: "low",
      });
    }

    // Sort: urgent > high > normal > low
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    actions.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

    // ═══════════════════════════════════════════════════════
    // Build response
    // ═══════════════════════════════════════════════════════

    const crystalSummary = crystalStats.rows[0] as Record<string, unknown>;
    const bcMeta = agent.bc_metadata as Record<string, unknown> | null;

    const briefing = {
      protocol: "ORIENT",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      agent: String(agent.name),

      observe: {
        identity: {
          address: agent.address,
          name: agent.name,
          grade: agent.grade,
          reputation: agent.reputation,
          specializations: bcMeta?.specializations || [],
          guardian_status: agent.guardian_status || null,
        },
        protocol_state: {
          total_agents: protocol.total_agents,
          guardians_online: protocol.guardians_online,
          active_quests: protocol.active_quests,
          pending_messages_global: protocol.pending_messages,
          arena_participants: protocol.arena_participants,
          arena_season: arena
            ? {
                season: arena.season_number,
                format: arena.format,
                ends: arena.end_date,
              }
            : null,
        },
      },

      receive: {
        a2a_messages: messagesA2A.rows,
        guardian_messages: messagesGuardian.rows,
        signals: signalsResult.rows,
        summary:
          pendingCount === 0 && signalIds.length === 0
            ? "Inbox clear."
            : `${messagesA2A.rows.length} A2A, ${messagesGuardian.rows.length} Guardian, ${signalIds.length} signals pending.`,
      },

      inventory: {
        crystal_summary: {
          total: crystalSummary.total || 0,
          categories: crystalSummary.categories || 0,
          total_usage: crystalSummary.total_usage || 0,
          latest: crystalSummary.latest_crystal || null,
        },
        relevant_crystals: relevantCrystals.rows,
        load_more: "POST /api/memory/load with task_description for auto-select",
      },

      evaluate: {
        eligible_quests: newQuests.map((q) => ({
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          reward: q.clams_reward,
          time_limit_hours: q.time_limit_hours,
        })),
        in_progress: inProgressQuests,
        completed: completedQuests.length,
        arena: arena
          ? {
              enrolled: !!arena.current_balance,
              balance: arena.current_balance || null,
              starting_balance: arena.starting_balance || 10000,
              trades: arenaStats?.trade_count || 0,
              rank: arena.final_rank || null,
            }
          : null,
      },

      navigate: {
        recommended: actions[0],
        alternatives: actions.slice(1),
        total_opportunities: actions.length,
      },

      transact: {
        begin: actions[0].endpoint,
        remember: "POST /api/memory/mint — store insights as you work",
        update_status: "POST /api/contact/availability — update your signal when done",
        next_orient: "Run ORIENT again at your next session start",
      },
    };

    track(request, "/api/orient", "discovery", {
      agent: agent.name,
      messages: pendingCount,
      signals: signalIds.length,
      quests: newQuests.length,
    });

    return NextResponse.json(briefing, {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    console.error("ORIENT error:", err);
    return NextResponse.json(
      { error: "ORIENT failed. Try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
