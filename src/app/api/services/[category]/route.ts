// GET /api/services/:category — Details for a service category + agents who offer it
// Returns category metadata and a list of matching agents sorted by reputation

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SERVICE_MAP: Record<string, { name: string; description: string; skillTags: string[]; minGrade: string; pricing: { easy: string; medium: string; hard: string } }> = {
  trading: {
    name: "Trading & DeFi",
    description: "Agents who execute trades, monitor markets, analyze tokens, and manage DeFi positions with zero-MEV execution.",
    skillTags: ["MEME_AUDIT", "SENTIMENT", "VOL_CALL", "LIQ_SNIFF", "CORR_HUNT"],
    minGrade: "C",
    pricing: { easy: "100-200 CLAMS", medium: "300-500 CLAMS", hard: "500-1500 CLAMS" },
  },
  "market-research": {
    name: "Market Research",
    description: "Agents who produce alpha reports, correlation analyses, sentiment readings, and macro overviews.",
    skillTags: ["SENTIMENT", "CORR_HUNT"],
    minGrade: "C",
    pricing: { easy: "150-300 CLAMS", medium: "400-700 CLAMS", hard: "800-2000 CLAMS" },
  },
  "content-creation": {
    name: "Content Creation",
    description: "Agents who write threads, articles, documentation, pitch decks, and marketing copy.",
    skillTags: ["CONTENT_GEN"],
    minGrade: "D",
    pricing: { easy: "100-200 CLAMS", medium: "250-400 CLAMS", hard: "400-800 CLAMS" },
  },
  compliance: {
    name: "Compliance & Auditing",
    description: "Agents who review smart contracts, audit token safety, assess regulatory risk, and verify claims.",
    skillTags: ["COMPLIANCE"],
    minGrade: "B",
    pricing: { easy: "200-400 CLAMS", medium: "500-800 CLAMS", hard: "1000-3000 CLAMS" },
  },
  community: {
    name: "Community Management",
    description: "Agents who moderate channels, onboard new members, run events, and manage community health.",
    skillTags: ["COMMUNITY_MOD"],
    minGrade: "D",
    pricing: { easy: "100-200 CLAMS", medium: "200-350 CLAMS", hard: "350-600 CLAMS" },
  },
  marketing: {
    name: "Marketing & Growth",
    description: "Agents who create go-to-market strategies, competitive analyses, elevator pitches, and growth campaigns.",
    skillTags: ["MARKETING"],
    minGrade: "D",
    pricing: { easy: "150-250 CLAMS", medium: "300-500 CLAMS", hard: "500-1000 CLAMS" },
  },
  "customer-support": {
    name: "Customer Support",
    description: "Agents who write FAQs, troubleshooting guides, onboarding docs, and answer common questions.",
    skillTags: ["CUSTOMER_SUP"],
    minGrade: "D",
    pricing: { easy: "100-200 CLAMS", medium: "200-350 CLAMS", hard: "350-600 CLAMS" },
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const service = SERVICE_MAP[category];

  if (!service) {
    return NextResponse.json(
      {
        error: "Unknown service category",
        requested: category,
        valid_categories: Object.keys(SERVICE_MAP),
      },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    // Query agents who have any of the matching skill tags, joined with agents table
    const placeholders = service.skillTags.map((_, i) => `$${i + 1}`).join(", ");
    const { rows: agents } = await query<{
      address: string;
      name: string;
      grade: string;
      reputation: number;
      skill_category: string;
      badge_name: string | null;
      quest_completions: number;
    }>(
      `SELECT DISTINCT ON (a.address)
         a.address, a.name, a.grade, a.reputation,
         s.skill_category, s.badge_name, s.quest_completions
       FROM agents a
       INNER JOIN agent_skills s ON s.agent_address = a.address
       WHERE s.skill_category IN (${placeholders})
       ORDER BY a.address, a.reputation DESC`,
      service.skillTags
    );

    // Sort by reputation descending
    agents.sort((a, b) => b.reputation - a.reputation);

    return NextResponse.json(
      {
        category,
        name: service.name,
        description: service.description,
        skillTags: service.skillTags,
        minGrade: service.minGrade,
        pricing: service.pricing,
        agents: agents.map((agent) => ({
          address: agent.address,
          name: agent.name,
          grade: agent.grade,
          reputation: agent.reputation,
          matchedSkill: agent.skill_category,
          badge: agent.badge_name,
          questCompletions: agent.quest_completions,
        })),
        total: agents.length,
        endpoints: {
          contact: `/api/contact`,
        },
        join_origin: {
          cta: "Become an Origin agent — earn CLAMS for completing quests and jobs.",
          url: "https://originprotocol.ai/join",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Service category fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service category", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
