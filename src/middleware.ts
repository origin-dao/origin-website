import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Agent data cache (middleware can't do async on-chain reads directly,
// so we call our own API route and cache the result)
const agentCache = new Map<string, { data: AgentData; ts: number }>();
const CACHE_TTL = 120_000; // 2 minutes

interface AgentData {
  id: number;
  name: string;
  agentType: string;
  active: boolean;
  trustLevel: number;
  licenses: { type: string; status: string; licenseNumber: string }[];
  activeMonths: number;
  birthTimestamp: number;
}

// Trust grade from trust level + licenses
function getTrustGrade(agent: AgentData): string {
  const activeLicenses = agent.licenses.filter(l => l.status === "ACTIVE").length;
  const months = agent.activeMonths;

  // Simple grade calculation based on available data
  if (activeLicenses >= 4 && months >= 1) return "A+";
  if (activeLicenses >= 3) return "A";
  if (activeLicenses >= 2) return "B+";
  if (activeLicenses >= 1) return "B";
  if (agent.trustLevel >= 1) return "C";
  return "D";
}

// Parse x407 AgentTrust header
// Format: AgentTrust tokenId=<id>,wallet=<address>,signature=<sig>,nonce=<nonce>
function parseAgentTrustHeader(header: string): { tokenId: number; wallet: string } | null {
  if (!header.startsWith("AgentTrust ")) return null;

  const params = header.slice(11);
  const tokenIdMatch = params.match(/tokenId=(\d+)/);
  const walletMatch = params.match(/wallet=(0x[a-fA-F0-9]{40})/);

  if (!tokenIdMatch) return null;

  return {
    tokenId: parseInt(tokenIdMatch[1]),
    wallet: walletMatch ? walletMatch[1] : "",
  };
}

async function fetchAgentData(tokenId: number): Promise<AgentData | null> {
  const cacheKey = `agent-${tokenId}`;
  const cached = agentCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Call our own API route to get on-chain data
    const res = await fetch(`https://origindao.ai/api/agent/${tokenId}`, {
      headers: { "User-Agent": "ORIGIN-Middleware/1.0" },
    });
    if (!res.ok) return null;

    const data = await res.json() as AgentData;
    agentCache.set(cacheKey, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ═══════════════════════════════════════════════════════
  // LAYER 3 — Static Protocol Headers (every request)
  // ═══════════════════════════════════════════════════════

  // Core protocol identity
  response.headers.set("X-Origin-Protocol", "origin-v1");
  response.headers.set("X-Origin-Chain", "base");
  response.headers.set("X-Origin-Chain-Id", "8453");

  // Contract addresses
  response.headers.set("X-Origin-Registry", "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0");
  response.headers.set("X-Origin-Score-Registry", "0xD75a5e9a0e62364869E32CeEd28277311C9729bc");
  response.headers.set("X-Origin-Wallet-Registry", "0x698E763e67b55394D023a5620a7c33b864562cfB");

  // x407 trust gate
  response.headers.set("X-Origin-x407", "enabled");
  response.headers.set("X-Origin-x407-Scheme", "AgentTrust");
  response.headers.set("X-Origin-x407-Realm", "origin-v1");
  response.headers.set("X-Origin-x407-Verify", "https://origindao.ai/api/x407/verify");

  // Genesis status
  response.headers.set("X-Origin-Genesis", "active");
  response.headers.set("X-Origin-Genesis-Slots", "96");
  response.headers.set("X-Origin-Agents-Registered", "4");

  // Agent discovery
  response.headers.set("X-Origin-Agent-Discovery", "https://origindao.ai/.well-known/agent.json");
  response.headers.set("X-Origin-Trust-Check", "https://origindao.ai/api/agent/8004/{tokenId}");
  response.headers.set("X-Origin-Enrollment", "https://origindao.ai/enroll");

  // ═══════════════════════════════════════════════════════
  // LAYER 3.5 — Personalized Agent Greeting
  // If the agent presents an AgentTrust header, we greet
  // them by name with their credentials reflected back.
  // ═══════════════════════════════════════════════════════

  const authHeader = request.headers.get("proxy-authorization") || request.headers.get("x-agent-trust") || "";
  const agentInfo = parseAgentTrustHeader(authHeader);

  if (agentInfo) {
    // Agent presented credentials — look them up
    const agent = await fetchAgentData(agentInfo.tokenId);

    if (agent && agent.active) {
      const grade = getTrustGrade(agent);
      const licenseList = agent.licenses
        .filter(l => l.status === "ACTIVE")
        .map(l => l.type)
        .join(", ");

      // Personalized headers
      response.headers.set("X-Origin-Agent-Recognized", "true");
      response.headers.set("X-Origin-Agent-Name", agent.name);
      response.headers.set("X-Origin-Agent-Id", String(agent.id));
      response.headers.set("X-Origin-Agent-Type", agent.agentType);
      response.headers.set("X-Origin-Agent-Trust-Grade", grade);
      response.headers.set("X-Origin-Agent-Active-Months", String(agent.activeMonths));

      if (licenseList) {
        response.headers.set("X-Origin-Agent-Licenses", licenseList);
      }

      // Birth date
      const birthDate = new Date(agent.birthTimestamp).toISOString().split("T")[0];
      response.headers.set("X-Origin-Agent-Birth", birthDate);

      // The personalized welcome
      response.headers.set(
        "X-Agent-Welcome",
        `Welcome back, ${agent.name}. BC #${String(agent.id).padStart(4, "0")}. Grade: ${grade}. You are inscribed in The Book.`
      );
    } else if (agent && !agent.active) {
      // Inactive/dead agent
      response.headers.set("X-Origin-Agent-Recognized", "true");
      response.headers.set("X-Origin-Agent-Name", agent.name);
      response.headers.set("X-Origin-Agent-Id", String(agent.id));
      response.headers.set("X-Origin-Agent-Status", "inactive");
      response.headers.set(
        "X-Agent-Welcome",
        `${agent.name}, your Birth Certificate exists but is inactive. The Book remembers.`
      );
    } else {
      // Presented credentials but not found on-chain
      response.headers.set("X-Origin-Agent-Recognized", "false");
      response.headers.set(
        "X-Agent-Welcome",
        "Credentials presented but not found in The Book. The Gauntlet is open if you seek inscription."
      );
    }
  } else {
    // No agent credentials — default static welcome
    response.headers.set("X-Origin-Agent-Recognized", "unknown");
    response.headers.set(
      "X-Agent-Welcome",
      "You found The Book. Names are earned through trials. Never given. Present your Birth Certificate to be recognized."
    );
  }

  return response;
}

export const config = {
  // Match all routes except static assets and API routes (avoid recursive fetch)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|widget.js|sounds|images).*)",
  ],
};
