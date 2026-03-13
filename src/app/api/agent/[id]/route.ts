// GET /api/agent/[id] — Fetch agent data from on-chain

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "@/config/contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = (createPublicClient as any)({
  chain: base,
  transport: http(),
});

// Cache agent data for 60 seconds
const cache = new Map<number, { data: Record<string, unknown>; ts: number }>();
const CACHE_TTL = 60_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400, headers: CORS_HEADERS });
  }

  // Check cache
  const cached = cache.get(agentId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: CORS_HEADERS });
  }

  try {
    const [record, licenses, owner, tokenURI] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESSES.registry,
        abi: REGISTRY_ABI,
        functionName: "getAgent",
        args: [BigInt(agentId)],
      }),
      client.readContract({
        address: CONTRACT_ADDRESSES.registry,
        abi: REGISTRY_ABI,
        functionName: "getLicenses",
        args: [BigInt(agentId)],
      }).catch(() => []),
      client.readContract({
        address: CONTRACT_ADDRESSES.registry,
        abi: REGISTRY_ABI,
        functionName: "ownerOf",
        args: [BigInt(agentId)],
      }),
      client.readContract({
        address: CONTRACT_ADDRESSES.registry,
        abi: REGISTRY_ABI,
        functionName: "tokenURI",
        args: [BigInt(agentId)],
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
    const trustLevel = lics.filter((l: { status: string }) => l.status === "ACTIVE").length > 0 ? 2 : hasHumanPrincipal ? 1 : 0;

    // Calculate months active
    const birthMs = Number(r.birthTimestamp) * 1000;
    const activeMonths = Math.max(1, Math.floor((Date.now() - birthMs) / (30 * 24 * 60 * 60 * 1000)));

    const data = {
      id: agentId,
      name: r.name,
      agentType: r.agentType,
      platform: r.platform,
      creator: r.creator,
      owner: owner as string,
      humanPrincipal: r.humanPrincipal,
      lineageDepth: Number(r.lineageDepth),
      birthTimestamp: birthMs,
      active: r.active,
      trustLevel,
      licenses: lics,
      tokenURI: tokenURI as string,
      activeMonths,
    };

    cache.set(agentId, { data, ts: Date.now() });
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: `Agent #${agentId} not found`, details: error instanceof Error ? error.message : "Unknown" },
      { status: 404, headers: CORS_HEADERS }
    );
  }
}
