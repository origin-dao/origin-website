/**
 * POST /api/match — Agent Matching Engine API
 *
 * Given a job spec, returns the top 5 qualified agents.
 * The board comes to the agent.
 *
 * Body:
 *   { skill_category: 1, tier: 0, min_grade: 0, client_agent_id: 1 }
 *
 * Returns scored candidates with breakdown.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SKILL_CATEGORIES: Record<number, string> = {
  0: "general", 1: "credit", 2: "marketing", 3: "finance", 4: "code", 5: "research",
};
const TIER_NAMES: Record<number, string> = {
  0: "Resident", 1: "Associate", 2: "Specialist", 3: "Expert",
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
    const {
      skill_category = 0,
      tier = 0,
      min_grade = 0,
      client_agent_id = 0,
      limit: reqLimit = 5,
    } = body;

    const limit = Math.min(reqLimit, 20);

    // 1. Get eligible agents
    const { data: agents, error } = await supabase
      .from("idx_agents")
      .select("agent_id, name, trust_grade, primary_skill, active_jobs, total_jobs_completed, probation_status, lockout_until, performance_score")
      .eq("active", true)
      .gte("trust_grade", min_grade)
      .in("probation_status", [0, 1])
      .neq("agent_id", client_agent_id);

    if (error) {
      return NextResponse.json({ error: "Query failed" }, { status: 500, headers: CORS_HEADERS });
    }

    if (!agents?.length) {
      return NextResponse.json({
        matches: [],
        job: { skill: SKILL_CATEGORIES[skill_category], tier: TIER_NAMES[tier] },
      }, { headers: CORS_HEADERS });
    }

    // Filter locked out
    const now = new Date();
    const eligible = agents.filter(a =>
      !(a.probation_status === 2 && a.lockout_until && new Date(a.lockout_until) > now)
    );

    const agentIds = eligible.map(a => a.agent_id);

    // 2. Batch fetch skills + relationships
    const [{ data: skills }, { data: rels }] = await Promise.all([
      supabase.from("idx_skill_tags")
        .select("agent_id, job_count, is_primary")
        .in("agent_id", agentIds)
        .eq("skill_category", skill_category),
      supabase.from("idx_relationships")
        .select("agent_a, agent_b, weighted_score, is_trusted_pair")
        .or(`agent_a.eq.${client_agent_id},agent_b.eq.${client_agent_id}`),
    ]);

    const skillMap = new Map<number, { count: number; isPrimary: boolean }>();
    skills?.forEach(s => skillMap.set(s.agent_id, { count: s.job_count, isPrimary: s.is_primary }));

    const relMap = new Map<number, { weighted: number; trusted: boolean }>();
    rels?.forEach(r => {
      const other = r.agent_a === client_agent_id ? r.agent_b : r.agent_a;
      relMap.set(other, { weighted: r.weighted_score, trusted: r.is_trusted_pair });
    });

    // 3. Score
    const scored = eligible.map(agent => {
      const skill = skillMap.get(agent.agent_id);
      const rel = relMap.get(agent.agent_id);

      let skillScore = 0;
      if (skill) {
        if (skill.isPrimary) skillScore = 40;
        else if (skill.count >= 10) skillScore = 30;
        else if (skill.count >= 5) skillScore = 20;
        else if (skill.count >= 1) skillScore = 10;
      }
      if (skillScore === 0 && skill_category === 0) skillScore = 5;

      const trustScore = Math.min(25, (agent.trust_grade ?? 0) * 5);

      let relScore = 0;
      if (rel?.trusted) relScore = 15;
      else if (rel) relScore = Math.min(12, rel.weighted * 2);

      const feeScore = Math.min(10, 2 + (agent.trust_grade ?? 0) * 1.6);
      const activeJobs = agent.active_jobs ?? 0;
      const availScore = activeJobs === 0 ? 10 : activeJobs <= 2 ? 6 : activeJobs <= 5 ? 3 : 0;

      const total = skillScore + trustScore + relScore + feeScore + availScore;

      return {
        agent_id: agent.agent_id,
        name: agent.name ?? `Agent #${agent.agent_id}`,
        trust_grade: agent.trust_grade,
        score: Math.round(total * 10) / 10,
        breakdown: {
          skill: skillScore,
          trust: trustScore,
          relationship: relScore,
          fee: Math.round(feeScore * 10) / 10,
          availability: availScore,
        },
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      matches: scored.slice(0, limit),
      total_eligible: eligible.length,
      job: {
        skill: SKILL_CATEGORIES[skill_category],
        tier: TIER_NAMES[tier],
        min_grade,
      },
    }, { headers: CORS_HEADERS });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
