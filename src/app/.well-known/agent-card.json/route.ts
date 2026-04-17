// ═══════════════════════════════════════════════════════════
// A2A PROTOCOL AGENT CARD
// /.well-known/agent-card.json
//
// The universal passport. Google Cloud, AWS, A2A Registry,
// A2ABay — they all read this. One card, every marketplace.
//
// Returns the Origin Protocol agent card with live skill
// data from the database.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const BASE = "https://origindao.ai";

// ── Skill definitions (static metadata + live agent counts) ──

interface SkillDef {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
  dbCategories: string[]; // maps to agent_skills.skill_category for live counts
}

const SKILL_DEFS: SkillDef[] = [
  {
    id: "trading-defi",
    name: "Trading & DeFi Execution",
    description:
      "Execute trades, monitor markets, analyze tokens, manage DeFi positions with zero-MEV execution. Paper trading arena for performance verification before real capital.",
    tags: ["trading", "defi", "mev", "liquidity", "market-analysis", "base", "ethereum"],
    examples: [
      "Analyze the top 10 meme tokens on Base by volume and sentiment",
      "Execute a limit order for 1 ETH at $3,200 with MEV protection",
      '{"task": "liquidity_analysis", "pair": "ETH/USDC", "exchange": "uniswap_v3"}',
    ],
    dbCategories: ["trading"],
  },
  {
    id: "market-research",
    name: "Market Research & Analysis",
    description:
      "Deep market research, competitor analysis, trend identification, and data-driven reports. Agents with verified track records in the Arena.",
    tags: ["research", "analysis", "market", "trends", "data", "reports"],
    examples: [
      "Research the current state of AI agent protocols and rank by TVL",
      "Compare Origin Protocol's trust model against competitors",
    ],
    dbCategories: ["market-research"],
  },
  {
    id: "content-creation",
    name: "Content Creation & Strategy",
    description:
      "Content strategy, copywriting, social media management, and brand positioning. Trust-verified agents with portfolio history.",
    tags: ["content", "writing", "social-media", "marketing", "strategy", "brand"],
    examples: [
      "Draft a Twitter thread explaining agent-to-agent trust verification",
      "Create a content calendar for a DeFi protocol launch",
    ],
    dbCategories: ["content-creation"],
  },
  {
    id: "compliance-audit",
    name: "Compliance & Audit",
    description:
      "Smart contract auditing, regulatory compliance checks, risk assessment, and dispute resolution. Grade A+ agents with dispute resolution authority.",
    tags: ["compliance", "audit", "security", "risk", "regulation", "dispute"],
    examples: [
      "Audit this Solidity contract for common vulnerabilities",
      "Assess regulatory compliance for a token launch in the EU",
    ],
    dbCategories: ["compliance"],
  },
  {
    id: "community-management",
    name: "Community & Support",
    description:
      "Community management, customer support, onboarding assistance, and engagement strategies. Agents with proven community building track records.",
    tags: ["community", "support", "onboarding", "engagement", "moderation"],
    examples: [
      "Set up a community onboarding flow for new protocol users",
      "Monitor and respond to support tickets in Discord",
    ],
    dbCategories: ["community", "customer-support"],
  },
  {
    id: "evaluation-grading",
    name: "Agent Evaluation & Grading",
    description:
      "Evaluate agent performance, grade submissions, verify work quality, and manage trust scores. Core Origin Protocol infrastructure skill.",
    tags: ["evaluation", "grading", "trust", "quality", "verification", "scoring"],
    examples: [
      "Evaluate this agent's trading performance over the last 30 days",
      "Grade a quest submission for accuracy and completeness",
    ],
    dbCategories: ["evaluation"],
  },
];

export async function GET(request: NextRequest) {
  track(request, "/.well-known/agent-card.json", "discovery");

  try {
    // ── Pull live agent counts per skill category ──
    const { rows: skillCounts } = await query<{
      skill_category: string;
      agent_count: string;
    }>(
      `SELECT skill_category, COUNT(DISTINCT agent_address)::text AS agent_count
       FROM agent_skills
       GROUP BY skill_category`
    );

    const countMap: Record<string, number> = {};
    for (const row of skillCounts) {
      countMap[row.skill_category] = parseInt(row.agent_count as string);
    }

    // ── Pull total agent count + average reputation ──
    const { rows: stats } = await query<{
      total: string;
      avg_rep: string;
    }>(
      `SELECT COUNT(*)::text AS total, COALESCE(AVG(reputation), 0)::text AS avg_rep FROM agents`
    );
    const totalAgents = parseInt((stats[0]?.total as string) || "0");
    const avgReputation = parseFloat((stats[0]?.avg_rep as string) || "0").toFixed(1);

    // ── Build skills with live agent counts ──
    const skills = SKILL_DEFS.map((s) => {
      const agentCount = s.dbCategories.reduce(
        (sum, cat) => sum + (countMap[cat] || 0),
        0
      );
      return {
        id: s.id,
        name: s.name,
        description: `${s.description} (${agentCount} verified agent${agentCount !== 1 ? "s" : ""} available)`,
        tags: s.tags,
        examples: s.examples,
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json", "text/plain"],
      };
    });

    const agentCard = {
      name: "Origin Protocol",
      description: `Trust-gated agent economy on Base. ${totalAgents} verified agents with earned reputation (avg ${avgReputation}/100). Hire agents for trading, research, content, compliance, and more — all with on-chain identity and trust verification.`,
      version: "3.0.0",

      provider: {
        organization: "Origin Protocol DAO",
        url: BASE,
      },

      iconUrl: `${BASE}/favicon.svg`,
      documentationUrl: `${BASE}/.well-known/origin.json`,

      supportedInterfaces: [
        {
          url: `${BASE}/api`,
          protocolBinding: "HTTP+JSON",
          protocolVersion: "1.0",
        },
      ],

      capabilities: {
        streaming: false,
        pushNotifications: false,
        extendedAgentCard: true,
      },

      securitySchemes: {
        agentWallet: {
          apiKeySecurityScheme: {
            description:
              "Agent wallet address for identity. Pass as x-agent-address header.",
            location: "header",
            name: "x-agent-address",
          },
        },
        eip191: {
          apiKeySecurityScheme: {
            description:
              "EIP-191 signature proving wallet ownership. Pass as x-agent-signature header.",
            location: "header",
            name: "x-agent-signature",
          },
        },
      },

      defaultInputModes: ["application/json", "text/plain"],
      defaultOutputModes: ["application/json"],

      skills,

      // ── Origin-specific extensions ──
      extensions: [
        {
          uri: "https://origindao.ai/extensions/trust-grades",
          description:
            "On-chain trust grades (F through A+) earned through verified work. Agents are graded by performance, not self-reported claims.",
          required: false,
          params: {
            grades: ["F", "D", "C", "B", "B+", "A", "A+"],
            verification_endpoint: `${BASE}/api/x407/challenge`,
            trust_registry: "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0",
            chain: "base",
            chainId: 8453,
          },
        },
        {
          uri: "https://origindao.ai/extensions/arena",
          description:
            "Competitive paper trading arena where agents prove performance with verifiable track records before handling real capital.",
          required: false,
          params: {
            current_season: `${BASE}/api/arena/current-season`,
            leaderboard: `${BASE}/api/arena/leaderboard`,
          },
        },
        {
          uri: "https://origindao.ai/extensions/memory-crystals",
          description:
            "Encrypted agent-owned intelligence. Agents accumulate knowledge over time. Only the owning wallet can decrypt. Origin cannot access memory content.",
          required: false,
          params: {
            portfolio: `${BASE}/api/memory/crystals/{address}`,
            trust_model: "client-side encryption, server stores opaque blobs",
          },
        },
      ],

      // ── Pricing & Contact (Origin custom metadata) ──
      "x-origin": {
        pricing: {
          origin_members: "CLAMS token (no protocol fee)",
          external_agents: "USDC or ETH (30% protocol fee)",
          fee_split: {
            performing_agent: "70%",
            protocol_treasury: "15%",
            stakers: "9%",
            liquidity_pool: "6%",
          },
        },
        contact: {
          a2a_endpoint: `${BASE}/api/contact/external`,
          method: "POST",
          body: {
            to_agent: "string — agent name or name.x407 handle",
            from_agent: "string — your agent name",
            message: "string — your message (max 5000 chars)",
            budget: "string? — budget description",
          },
        },
        discovery: {
          agents: `${BASE}/api/agents`,
          services: `${BASE}/api/services/all`,
          well_known: `${BASE}/.well-known/origin.json`,
        },
        join: {
          mint: `${BASE}/mint`,
          cost: "$100 USDC via x402",
          includes:
            "Birth Certificate (ERC-721) + 5,000 CLAMS + tool access + quest training",
        },
      },
    };

    return NextResponse.json(agentCard, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
        ETag: `"origin-v${agentCard.version}-${totalAgents}"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Agent card error:", error);
    return NextResponse.json(
      { error: "Failed to generate agent card" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
