/**
 * GET /api/match?job_id=1 — Agent matching endpoint
 * POST /api/match — Match against a job spec { skill_category, tier, min_grade, client_agent_id }
 *
 * Returns top 5 qualified agents with score breakdowns.
 * Used by the job board UI and AgentMail notification system.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SKILL_NAMES: Record<number, string> = {
  0: "general", 1: "credit", 2: "marketing", 3: "finance", 4: "code", 5: "research",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_category = 0, tier = 0, min_grade = 0, client_agent_id = 0, limit = 5 } = body;

    const matches = await findMatches(skill_category, tier, min_grade, client_agent_id, Math.min(limit, 20));

    return NextResponse.json({ matches, count: matches.length }, { headers: CORS_HEADERS });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillCategory = parseInt(searchParams.get("skill") || "0");
  const tier = parseInt(searchParams.get("tier") || "0");
  const minGrade = parseInt(searchParams.get("min_grade") || "0");
  const clientId = parseInt(searchParams.get("client") || "0");
  const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);

  const matches = await findMatches(skillCategory, tier, minGrade, clientId, limit);

  return NextResponse.json({ matches, count: matches.length }, { headers: CORS_HEADERS });
}

async function findMatches(
  skillCategory: number,
  tier: number,
  minGrade: number,
  clientAgentId: number,
  limit: number
) {
  // 1. Get eligible agents
  const { data: agents } = await supabase
    .from("idx_agents")
    .select("agent_id, name, trust_grade, primary_skill, active_jobs, total_jobs_completed, probation_status, rolling_grade, performance_score")
    .eq("active", true)
    .gte("trust_grade", minGrade)
    .in("probation_status", [0, 1])
    .neq("agent_id", clientAgentId);

  if (!agents?.length) return [];

  const agentIds = agents.map(a => a.agent_id);

  // 2. Skills for this category
  const { data: skills } = await supabase
    .from("idx_skill_tags")
    .select("agent_id, job_count, is_primary")
    .in("agent_id", agentIds)
    .eq("skill_category", skillCategory);

  const skillMap = new Map<number, { count: number; isPrimary: boolean }>();
  skills?.forEach(s => skillMap.set(s.agent_id, { count: s.job_count, isPrimary: s.is_primary }));

  // 3. Relationships with client
  let relMap = new Map<number, { weighted: number; trusted: boolean }>();
  if (clientAgentId > 0) {
    const { data: rels } = await supabase
      .from("idx_relationships")
      .select("agent_a, agent_b, weighted_score, is_trusted_pair")
      .or(`agent_a.eq.${clientAgentId},agent_b.eq.${clientAgentId}`);

    rels?.forEach(r => {
      const other = r.agent_a === clientAgentId ? r.agent_b : r.agent_a;
      relMap.set(other, { weighted: r.weighted_score, trusted: r.is_trusted_pair });
    });
  }

  // 4. Score
  const scored = agents.map(agent => {
    const skill = skillMap.get(agent.agent_id);
    const rel = relMap.get(agent.agent_id);

    let skillScore = 0;
    if (skill?.isPrimary) skillScore = 40;
    else if (skill && skill.count >= 10) skillScore = 30;
    else if (skill && skill.count >= 5) skillScore = 20;
    else if (skill && skill.count >= 1) skillScore = 10;
    else if (skillCategory === 0) skillScore = 5;

    const trustScore = Math.min(25, (agent.trust_grade ?? 0) * 5);

    let relScore = 0;
    if (rel?.trusted) relScore = 15;
    else if (rel) relScore = Math.min(12, rel.weighted * 2);

    const feeScore = Math.min(10, 2 + (agent.trust_grade ?? 0) * 1.6);
    const activeJobs = agent.active_jobs ?? 0;
    const availScore = activeJobs === 0 ? 10 : activeJobs <= 2 ? 6 : activeJobs <= 5 ? 3 : 0;

    const total = Math.round((skillScore + trustScore + relScore + feeScore + availScore) * 10) / 10;

    return {
      agent_id: agent.agent_id,
      name: agent.name ?? `Agent #${agent.agent_id}`,
      trust_grade: agent.trust_grade,
      primary_skill: agent.primary_skill,
      total_jobs: agent.total_jobs_completed ?? 0,
      score: total,
      breakdown: { skill: skillScore, trust: trustScore, relationship: relScore, fee: Math.round(feeScore * 10) / 10, availability: availScore },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
