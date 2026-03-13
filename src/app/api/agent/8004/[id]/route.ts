// GET /api/agent/8004/[id] — Fetch agent from ERC-8004 Identity Registry on Base
// Returns 8004 identity data + ORIGIN enrollment status
// Analytics: tracks unique queries for conversion funnel

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ERC-8004 Identity Registry on Base mainnet
const ERC8004_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`;

// ORIGIN ERC-8004 Adapter
const ORIGIN_ADAPTER = "0x247C592FD49b8845C538134B79F98c6CBF04D7D2" as const;

// Minimal ERC-8004 Identity Registry ABI
const ERC8004_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = (createPublicClient as any)({
  chain: base,
  transport: http(),
});

// Analytics: in-memory counters (replace with Supabase/Redis in production)
const analytics = {
  queries: new Map<number, { count: number; first: number; last: number }>(),
  totalQueries: 0,
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = parseInt(id);

  if (isNaN(agentId) || agentId < 1) {
    return NextResponse.json(
      { error: "Invalid agent ID" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Track analytics
  analytics.totalQueries++;
  const existing = analytics.queries.get(agentId);
  if (existing) {
    existing.count++;
    existing.last = Date.now();
  } else {
    analytics.queries.set(agentId, { count: 1, first: Date.now(), last: Date.now() });
  }

  try {
    // Read from ERC-8004 Identity Registry
    const [owner, tokenURI] = await Promise.all([
      client.readContract({
        address: ERC8004_REGISTRY,
        abi: ERC8004_ABI,
        functionName: "ownerOf",
        args: [BigInt(agentId)],
      }),
      client.readContract({
        address: ERC8004_REGISTRY,
        abi: ERC8004_ABI,
        functionName: "tokenURI",
        args: [BigInt(agentId)],
      }).catch(() => ""),
    ]);

    // Try to fetch the registration file from tokenURI
    let registrationData: Record<string, unknown> = {};
    const uri = tokenURI as string;
    if (uri) {
      try {
        if (uri.startsWith("data:application/json;base64,")) {
          const json = Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString();
          registrationData = JSON.parse(json);
        } else if (uri.startsWith("http")) {
          const res = await fetch(uri, { signal: AbortSignal.timeout(5000) });
          if (res.ok) registrationData = await res.json();
        } else if (uri.startsWith("ipfs://")) {
          const cid = uri.replace("ipfs://", "");
          const res = await fetch(`https://ipfs.io/ipfs/${cid}`, { signal: AbortSignal.timeout(5000) });
          if (res.ok) registrationData = await res.json();
        }
      } catch {
        // Registration file fetch failed — that's OK, identity still valid
      }
    }

    // Check if this agent has a corresponding ORIGIN Birth Certificate
    // (by checking if the same owner has any ORIGIN tokens — simplified check)
    let originStatus: "NONE" | "ENROLLED" | "VERIFIED" = "NONE";
    let originAgentId: number | null = null;

    // TODO: Once we build the cross-reference registry, look up directly
    // For now, the status is always NONE unless manually linked

    const data = {
      // Source
      source: "erc8004",
      registry: ERC8004_REGISTRY,
      globalId: `eip155:8453:${ERC8004_REGISTRY}:${agentId}`,

      // Identity
      id: agentId,
      owner: owner as string,
      tokenURI: uri,
      name: (registrationData.name as string) || `Agent #${agentId}`,
      description: (registrationData.description as string) || null,
      image: (registrationData.image as string) || null,
      services: (registrationData.services as unknown[]) || [],
      active: (registrationData.active as boolean) ?? true,

      // ORIGIN integration status
      origin: {
        status: originStatus, // NONE | ENROLLED | VERIFIED
        trustLevel: null,     // null until gauntlet passed
        agentId: originAgentId,
        adapter: ORIGIN_ADAPTER,
        gauntletUrl: "https://origindao.ai/enroll",
        message: originStatus === "NONE"
          ? "This agent has ERC-8004 identity but has not completed the ORIGIN Gauntlet. Take the gauntlet to unlock trust grades, jobs, and capital access."
          : originStatus === "ENROLLED"
          ? "Gauntlet in progress."
          : "Fully verified ORIGIN agent.",
      },

      // Meta
      queriedAt: new Date().toISOString(),
    };

    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        error: `ERC-8004 agent #${agentId} not found on Base`,
        details: error instanceof Error ? error.message : "Unknown",
        registry: ERC8004_REGISTRY,
      },
      { status: 404, headers: CORS_HEADERS }
    );
  }
}
