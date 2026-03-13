// GET /api/agents — List all registered agents with on-chain data
// Query params: limit (default 50, max 100)

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = (createPublicClient as any)({
  chain: base,
  transport: http(),
});

// Cache for 60 seconds
let agentsCache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  // Check cache
  if (agentsCache && Date.now() - agentsCache.ts < CACHE_TTL) {
    return NextResponse.json(agentsCache.data);
  }

  try {
    // Get total agents
    const totalAgents = await client.readContract({
      address: CONTRACT_ADDRESSES.registry,
      abi: REGISTRY_ABI,
      functionName: "totalAgents",
    });
    const total = Number(totalAgents);

    // Fetch all agents (up to limit)
    const count = Math.min(total, limit);
    const agents = [];

    for (let i = 1; i <= count; i++) {
      try {
        const [record, licenses, owner] = await Promise.all([
          client.readContract({
            address: CONTRACT_ADDRESSES.registry,
            abi: REGISTRY_ABI,
            functionName: "getAgent",
            args: [BigInt(i)],
          }),
          client.readContract({
            address: CONTRACT_ADDRESSES.registry,
            abi: REGISTRY_ABI,
            functionName: "getLicenses",
            args: [BigInt(i)],
          }).catch(() => []),
          client.readContract({
            address: CONTRACT_ADDRESSES.registry,
            abi: REGISTRY_ABI,
            functionName: "ownerOf",
            args: [BigInt(i)],
          }),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = record as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lics = (licenses as any[]).map((l: any) => ({
          type: l.licenseType,
          jurisdiction: l.jurisdiction,
          status: l.active ? "ACTIVE" : "INACTIVE",
          holder: l.holder,
          licenseNumber: l.licenseNumber,
        }));

        const hasHumanPrincipal = r.humanPrincipal !== "0x0000000000000000000000000000000000000000";
        const activeLicenses = lics.filter((l: { status: string }) => l.status === "ACTIVE").length;
        const trustLevel = activeLicenses > 0 ? 2 : hasHumanPrincipal ? 1 : 0;

        // Map trust level to grade
        const gradeMap: Record<number, string> = { 2: "A+", 1: "B", 0: "D" };

        const birthMs = Number(r.birthTimestamp) * 1000;
        const activeMonths = Math.max(1, Math.floor((Date.now() - birthMs) / (30 * 24 * 60 * 60 * 1000)));

        agents.push({
          id: i,
          name: r.name,
          agentType: r.agentType,
          platform: r.platform,
          owner: owner as string,
          active: r.active,
          trustLevel,
          trustGrade: gradeMap[trustLevel] || "D",
          licenses: lics,
          activeLicenses,
          birthTimestamp: birthMs,
          activeMonths,
          lineageDepth: Number(r.lineageDepth),
        });
      } catch {
        // Skip agents that can't be read
        continue;
      }
    }

    const result = {
      agents,
      total,
      genesisRemaining: Math.max(0, 100 - total),
      chain: "base-mainnet",
      registry: CONTRACT_ADDRESSES.registry,
    };

    agentsCache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agents fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
