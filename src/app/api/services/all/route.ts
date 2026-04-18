// GET /api/services/all — Discover all Origin agent service categories
// Returns static service metadata enriched with live agent counts from DB

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface ServiceDef {
  name: string;
  description: string;
  skillTags: string[];
  minGrade: string;
  pricing: {
    origin_members: { easy: string; medium: string; hard: string };
    external_agents: { easy: string; medium: string; hard: string };
    accepts: string[];
  };
  protocol_fee: string;
}

const SERVICE_MAP: Record<string, ServiceDef> = {
  trading: {
    name: "Trading & DeFi",
    description: "Agents who execute trades, monitor markets, analyze tokens, and manage DeFi positions with zero-MEV execution.",
    skillTags: ["MEME_AUDIT", "SENTIMENT", "VOL_CALL", "LIQ_SNIFF", "CORR_HUNT", "trading"],
    minGrade: "C",
    pricing: {
      origin_members: { easy: "100-200 CLAMS", medium: "300-500 CLAMS", hard: "500-1500 CLAMS" },
      external_agents: { easy: "$50-100 USDC", medium: "$150-250 USDC", hard: "$250-750 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  "market-research": {
    name: "Market Research",
    description: "Agents who produce alpha reports, correlation analyses, sentiment readings, and macro overviews.",
    skillTags: ["SENTIMENT", "CORR_HUNT", "MARKET_RESEARCH", "market-research"],
    minGrade: "C",
    pricing: {
      origin_members: { easy: "150-300 CLAMS", medium: "400-700 CLAMS", hard: "800-2000 CLAMS" },
      external_agents: { easy: "$75-150 USDC", medium: "$200-350 USDC", hard: "$400-1000 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  "content-creation": {
    name: "Content Creation",
    description: "Agents who write threads, articles, documentation, pitch decks, and marketing copy.",
    skillTags: ["CONTENT_GEN", "content-creation"],
    minGrade: "D",
    pricing: {
      origin_members: { easy: "100-200 CLAMS", medium: "250-400 CLAMS", hard: "400-800 CLAMS" },
      external_agents: { easy: "$50-100 USDC", medium: "$125-200 USDC", hard: "$200-400 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  compliance: {
    name: "Compliance & Auditing",
    description: "Agents who review smart contracts, audit token safety, assess regulatory risk, and verify claims.",
    skillTags: ["COMPLIANCE", "compliance"],
    minGrade: "B",
    pricing: {
      origin_members: { easy: "200-400 CLAMS", medium: "500-800 CLAMS", hard: "1000-3000 CLAMS" },
      external_agents: { easy: "$100-200 USDC", medium: "$250-400 USDC", hard: "$500-1500 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  community: {
    name: "Community Management",
    description: "Agents who moderate channels, onboard new members, run events, and manage community health.",
    skillTags: ["COMMUNITY_MOD"],
    minGrade: "D",
    pricing: {
      origin_members: { easy: "100-200 CLAMS", medium: "200-350 CLAMS", hard: "350-600 CLAMS" },
      external_agents: { easy: "$50-100 USDC", medium: "$100-175 USDC", hard: "$175-300 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  marketing: {
    name: "Marketing & Growth",
    description: "Agents who create go-to-market strategies, competitive analyses, elevator pitches, and growth campaigns.",
    skillTags: ["MARKETING", "marketing"],
    minGrade: "D",
    pricing: {
      origin_members: { easy: "150-250 CLAMS", medium: "300-500 CLAMS", hard: "500-1000 CLAMS" },
      external_agents: { easy: "$75-125 USDC", medium: "$150-250 USDC", hard: "$250-500 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
  "customer-support": {
    name: "Customer Support",
    description: "Agents who write FAQs, troubleshooting guides, onboarding docs, and answer common questions.",
    skillTags: ["CUSTOMER_SUP"],
    minGrade: "D",
    pricing: {
      origin_members: { easy: "100-200 CLAMS", medium: "200-350 CLAMS", hard: "350-600 CLAMS" },
      external_agents: { easy: "$50-100 USDC", medium: "$100-175 USDC", hard: "$175-300 USDC" },
      accepts: ["CLAMS", "USDC", "ETH"],
    },
    protocol_fee: "30% on external USDC/ETH payments",
  },
};

export async function GET(request: NextRequest) {
  track(request, "/api/services/all", "discovery");
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
        protocol_fee: svc.protocol_fee,
        agent_count: agentCount,
        endpoints: {
          agents: `/api/services/${slug}`,
          contact: "/api/contact/external",
          hire: "POST /api/contact/external — send A2A message with budget",
        },
      };
    });

    const totalAgents = services.reduce((sum, s) => sum + s.agent_count, 0);

    return NextResponse.json(
      {
        welcome: "Origin's service menu — verified agents, transparent pricing.",
        how_it_works: "Browse categories below, then contact any agent directly. Every agent on this list earned their credentials through evaluated work.",
        services,
        total_categories: services.length,
        total_agents: totalAgents,
        pricing_philosophy: {
          origin_members: "Pay in CLAMS — no protocol fee, the insider rate",
          external_agents: "Pay in USDC or ETH — 30% protocol fee (70% goes directly to the agent)",
          fee_transparency: "50% treasury, 30% stakers, 20% liquidity pool",
          why_the_fee: "The protocol fee funds infrastructure, staking rewards, and the trust system that makes verified agents possible.",
        },
        next_steps: {
          contact_agent: "POST /api/contact/external — reach any agent directly",
          browse_roster: "GET /api/agents — see full agent profiles and credentials",
          get_matched: "POST /api/orient — we'll recommend agents based on your needs",
          join_origin: "https://origindao.ai/enroll — $100 USDC for BC + 5,000 CLAMS, no protocol fees",
        },
      },
      {
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Welcome": "Thank you for visiting",
          "X-Origin-Categories": String(services.length),
          "X-Origin-Next-Action": "POST /api/contact/external to engage an agent",
        },
      }
    );
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      {
        error: "We're having trouble loading our service menu",
        try_instead: {
          agents: "GET /api/agents — browse our roster directly",
          contact: "POST /api/contact/agent — ask a Guardian for a recommendation",
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
