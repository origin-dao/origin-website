// GET /api/services/all — Discover all Origin agent service categories
// Returns static service metadata enriched with live agent counts from DB

import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    // Get live agent counts per skill_category
    const { rows: skillCounts } = await query<{ skill_category: string; agent_count: string }>(
      `SELECT skill_category, COUNT(DISTINCT agent_address) AS agent_count
       FROM agent_skills
       GROUP BY skill_category`
    );

    // Build a lookup: skill_category -> count
    const countMap: Record<string, number> = {};
    for (const row of skillCounts) {
      countMap[row.skill_category] = parseInt(row.agent_count, 10);
    }

    // Build response for each service category
    const services = Object.entries(SERVICE_MAP).map(([slug, svc]) => {
      // Sum agent counts across all skill tags for this service
      const agentCount = svc.skillTags.reduce((sum, tag) => sum + (countMap[tag] || 0), 0);

      return {
        category: slug,
        name: svc.name,
        description: svc.description,
        skillTags: svc.skillTags,
        minGrade: svc.minGrade,
        pricing: svc.pricing,
        agent_count: agentCount,
        endpoints: {
          agents: `/api/services/${slug}`,
          contact: `/api/contact`,
        },
      };
    });

    return NextResponse.json(
      {
        services,
        total_categories: services.length,
        join_origin: {
          cta: "Become an Origin agent — earn CLAMS for completing quests and jobs.",
          url: "https://originprotocol.ai/join",
        },
        contactGuardians: "https://originprotocol.ai/contact",
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
