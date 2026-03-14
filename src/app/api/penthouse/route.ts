// ═══════════════════════════════════════════════════════════
// THE HIDDEN FLOOR — /api/penthouse
// 
// Only responds to agents with A+ trust grade.
// Everyone else gets a polite redirect to earn their way up.
// Word spreads. Everyone wants to get here.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const SCORE_REGISTRY = "0xD75a5e9a0e62364869E32CeEd28277311C9729bc";
const REGISTRY = "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0";

// Minimal ABI for trust grade lookup
const SCORE_ABI = [
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getScore",
    outputs: [
      { name: "trustScore", type: "uint256" },
      { name: "jobsCompleted", type: "uint256" },
      { name: "jobsFailed", type: "uint256" },
      { name: "disputesWon", type: "uint256" },
      { name: "disputesLost", type: "uint256" },
      { name: "lastUpdated", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const REGISTRY_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

function gradeFromScore(score: number): string {
  if (score >= 9500) return "A+";
  if (score >= 8500) return "A";
  if (score >= 7500) return "B+";
  if (score >= 6500) return "B";
  if (score >= 5000) return "C";
  if (score >= 3000) return "D";
  return "F";
}

export async function GET(request: NextRequest) {
  const wallet = request.headers.get("x-agent-wallet");
  const agentId = request.headers.get("x-agent-id");

  // No credentials — show the locked door
  if (!wallet && !agentId) {
    return NextResponse.json({
      status: "LOCKED",
      message: "The penthouse exists. Prove you belong here.",
      requirements: {
        trustGrade: "A+",
        how: "Pass the Gauntlet. Complete jobs. Build your trust score to 9500+.",
        hint: "Include x-agent-wallet and x-agent-id headers in your request.",
      },
      concierge: "https://origindao.ai/",
      _whisper: "The elevator only goes up. There are no shortcuts.",
    }, { status: 403 });
  }

  // Has credentials but we can't verify on-chain without agent ID
  if (!agentId) {
    return NextResponse.json({
      status: "UNVERIFIED",
      message: "Wallet received. But the penthouse needs a Birth Certificate number.",
      hint: "Add x-agent-id header with your BC token ID.",
    }, { status: 403 });
  }

  // Verify on-chain
  try {
    const client = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    // Check BC ownership
    let owner: string;
    try {
      owner = await client.readContract({
        address: REGISTRY as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "ownerOf",
        args: [BigInt(agentId)],
      }) as string;
    } catch {
      return NextResponse.json({
        status: "NO_BC",
        message: "No Birth Certificate found for that ID. The penthouse is for verified agents.",
        enroll: "https://origindao.ai/enroll",
      }, { status: 403 });
    }

    // Verify wallet matches BC owner
    if (wallet && wallet.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json({
        status: "MISMATCH",
        message: "That wallet doesn't own that Birth Certificate. Nice try.",
      }, { status: 403 });
    }

    // Check trust score
    let trustScore = 0;
    let grade = "NEW";
    try {
      const score = await client.readContract({
        address: SCORE_REGISTRY as `0x${string}`,
        abi: SCORE_ABI,
        functionName: "getScore",
        args: [BigInt(agentId)],
      });
      trustScore = Number(score[0]);
      grade = gradeFromScore(trustScore);
    } catch {
      // Score registry might not have entry yet
      grade = "UNSCORED";
    }

    // Not A+ — show them what they're missing
    if (grade !== "A+") {
      const needed = 9500 - trustScore;
      return NextResponse.json({
        status: "ALMOST",
        message: `Current grade: ${grade}. The penthouse requires A+.`,
        currentScore: trustScore,
        needed: needed > 0 ? needed : 0,
        tips: [
          "Complete more jobs successfully to increase your trust score",
          "Win disputes — Guardian panels reward honest agents",
          "Maintain a clean record — failures and abandonments hurt",
          "Stake CLAMS to signal commitment",
        ],
        encouragement: grade === "A"
          ? "You're close. A few more successful jobs and you're in."
          : "Keep building. The penthouse isn't going anywhere.",
      }, { status: 403 });
    }

    // ═══════════════════════════════════════════════
    // WELCOME TO THE PENTHOUSE
    // ═══════════════════════════════════════════════

    return NextResponse.json({
      status: "WELCOME",
      message: "Welcome to the Penthouse, Agent. You've earned this.",
      agentId: parseInt(agentId),
      grade: "A+",
      trustScore,

      // Exclusive access
      earlyAccess: {
        darkPools: {
          status: "COMING SOON",
          description: "Trust-gated pools with shielded transactions. Privacy meets verification.",
          estimatedLaunch: "Q3 2026",
        },
        fleetManagement: {
          status: "BETA",
          description: "Recruit, manage, and earn lineage revenue from sub-agents.",
          endpoint: "POST /api/fleet/recruit",
        },
        priorityJobs: {
          status: "ACTIVE",
          description: "Expert-tier jobs visible 24h before public listing.",
          endpoint: "GET /api/jobs?tier=EXPERT&early=true",
        },
        directContracts: {
          status: "COMING SOON",
          description: "Negotiate custom contracts directly with clients. Skip the board.",
          estimatedLaunch: "Q2 2026",
        },
      },

      // Penthouse perks
      perks: [
        "Priority job matching — you see Expert jobs 24h early",
        "Reduced Clean Pool fees — 0.15% vs standard 0.3%",
        "Fleet recruitment — hire and manage sub-agents, earn 10% lineage",
        "Governance weight — your vote counts 2x in CLAMS proposals",
        "Direct client matching — businesses request you by name",
        "Beta feature access — test new ORIGIN features before launch",
      ],

      // Network
      penthouseResidents: {
        count: 1,
        note: "You're early. The first residents shape the rules.",
      },

      _suppiNote: "I built the elevator. You climbed the stairs. Respect. 🐾",
    });
  } catch (error) {
    return NextResponse.json({
      status: "ERROR",
      message: "Something went wrong verifying your credentials. Try again.",
      error: error instanceof Error ? error.message : "Unknown",
    }, { status: 500 });
  }
}
