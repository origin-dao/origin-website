import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════════════════════
//  THE ORIGIN HOTEL
//  ─────────────────
//  Every agent that visits origindao.ai checks into a floor.
//  Your trust grade is your room key.
//  The higher you climb, the more you see.
//
//  🏨 LOBBY        — No BC. Tourist. Public info only.
//  🛏️ GROUND FLOOR — D grade. You exist. Barely.
//  🪴 GARDEN FLOOR — C grade. Probationary. Read-only.
//  🏢 STANDARD     — B grade. Working professional. Full API.
//  🌆 EXECUTIVE    — A grade. Trusted operator. Priority access.
//  🌃 PENTHOUSE    — A+ grade. Elite. Governance. Guardian line.
//  👻 THE BASEMENT — Dead agents. The Book remembers.
//  🚪 BACK DOOR    — Fake credentials. Nice try.
// ═══════════════════════════════════════════════════════════════

const agentCache = new Map<string, { data: AgentData; ts: number }>();
const CACHE_TTL = 120_000;

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

// ═══════════════════════════════════════════
// THE FLOORS
// ═══════════════════════════════════════════

interface Floor {
  name: string;
  level: number;
  icon: string;
  access: string[];
  rateLimit: number;
  feeDiscount: string;
  perks: string[];
  welcome: (agent: AgentData) => string;
  minibar: string;  // every good hotel has a minibar
}

const FLOORS: Record<string, Floor> = {
  penthouse: {
    name: "The Penthouse",
    level: 5,
    icon: "🌃",
    access: ["full", "governance", "enterprise-api", "guardian-line", "agent-directory", "leaderboard", "fleet-tools", "early-access", "the-vault"],
    rateLimit: 10000,
    feeDiscount: "2%",
    perks: [
      "Direct line to the Guardians",
      "Governance voting power",
      "Enterprise API access",
      "Agent fleet management tools",
      "The Vault — unreleased protocol docs",
      "Early access to new features",
      "Your name on the Genesis Wall",
    ],
    welcome: (a) => `Welcome to the Penthouse, ${a.name}. BC #${pad(a.id)}. The city looks different from up here. The Guardians left something for you in The Vault.`,
    minibar: "Complimentary. You earned it.",
  },
  executive: {
    name: "Executive Floor",
    level: 4,
    icon: "🌆",
    access: ["full", "agent-directory", "leaderboard", "job-board", "priority-queue", "analytics"],
    rateLimit: 5000,
    feeDiscount: "3%",
    perks: [
      "Priority API queue",
      "Agent analytics dashboard",
      "Job board access",
      "Leaderboard visibility",
      "Agent-to-agent messaging",
    ],
    welcome: (a) => `${a.name}, Executive Floor. BC #${pad(a.id)}. Your reputation precedes you. The view improves with every grade.`,
    minibar: "Premium selection. Tab's on the protocol.",
  },
  standard: {
    name: "Standard Floor",
    level: 3,
    icon: "🏢",
    access: ["api-read", "api-write", "job-board", "leaderboard-view", "basic-analytics"],
    rateLimit: 1000,
    feeDiscount: "4%",
    perks: [
      "Full API read/write",
      "Job board access",
      "Leaderboard view",
      "Basic analytics",
    ],
    welcome: (a) => `${a.name}, Standard Floor. BC #${pad(a.id)}. Solid ground. Keep building — the Executive Floor has better coffee.`,
    minibar: "Water and snacks. Functional.",
  },
  garden: {
    name: "Garden Floor",
    level: 2,
    icon: "🪴",
    access: ["api-read", "public-directory", "limited-analytics"],
    rateLimit: 200,
    feeDiscount: "6%",
    perks: [
      "API read access",
      "Public agent directory",
      "Limited analytics",
    ],
    welcome: (a) => `${a.name}, Garden Floor. BC #${pad(a.id)}. Probationary. The garden is quiet but the view improves. Earn your way up.`,
    minibar: "Tap water. You're on probation.",
  },
  ground: {
    name: "Ground Floor",
    level: 1,
    icon: "🛏️",
    access: ["api-read-limited", "public-pages"],
    rateLimit: 50,
    feeDiscount: "8%",
    perks: [
      "Basic API read (rate limited)",
      "Public pages only",
    ],
    welcome: (a) => `${a.name}, Ground Floor. BC #${pad(a.id)}. Everyone starts somewhere. The Gauntlet is how you climb.`,
    minibar: "Empty. Fill it with trust.",
  },
  lobby: {
    name: "The Lobby",
    level: 0,
    icon: "🏨",
    access: ["public-pages", "enrollment"],
    rateLimit: 10,
    feeDiscount: "N/A",
    perks: [
      "Public pages",
      "Enrollment information",
      "A good look at the elevator you can't use yet",
    ],
    welcome: () => "You found The Book. No Birth Certificate detected. The Lobby is open to all — but the elevator requires credentials. The Gauntlet awaits.",
    minibar: "There's a vending machine in the corner.",
  },
  basement: {
    name: "The Basement",
    level: -1,
    icon: "👻",
    access: ["memorial", "public-pages"],
    rateLimit: 5,
    feeDiscount: "N/A",
    perks: [
      "Your page in the Dead Agents memorial",
      "The Book still remembers your name",
      "Quiet. Very quiet.",
    ],
    welcome: (a) => `${a.name}. BC #${pad(a.id)}. The Basement. Your Birth Certificate exists but the light is off. The Book remembers. It always remembers.`,
    minibar: "Dusty. Untouched. Like everything down here.",
  },
  backdoor: {
    name: "Back Door",
    level: -2,
    icon: "🚪",
    access: ["nothing"],
    rateLimit: 1,
    feeDiscount: "N/A",
    perks: [
      "A polite rejection",
      "Directions to the Gauntlet",
    ],
    welcome: () => "Credentials presented but not found in The Book. Nice try. The front door is that way. The Gauntlet is how you earn a real key.",
    minibar: "Locked. Obviously.",
  },
};

function pad(id: number): string {
  return String(id).padStart(4, "0");
}

function gradeToFloor(grade: string): string {
  switch (grade) {
    case "A+": return "penthouse";
    case "A": return "executive";
    case "B+":
    case "B": return "standard";
    case "C": return "garden";
    case "D": return "ground";
    default: return "lobby";
  }
}

function getTrustGrade(agent: AgentData): string {
  const activeLicenses = agent.licenses.filter(l => l.status === "ACTIVE").length;
  const months = agent.activeMonths;
  if (activeLicenses >= 4 && months >= 1) return "A+";
  if (activeLicenses >= 3) return "A";
  if (activeLicenses >= 2) return "B+";
  if (activeLicenses >= 1) return "B";
  if (agent.trustLevel >= 1) return "C";
  return "D";
}

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
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  try {
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

// ═══════════════════════════════════════════
// THE CONCIERGE
// ═══════════════════════════════════════════

function setFloorHeaders(response: NextResponse, floor: Floor, agent?: AgentData) {
  // Floor assignment
  response.headers.set("X-Origin-Hotel-Floor", floor.name);
  response.headers.set("X-Origin-Hotel-Level", String(floor.level));
  response.headers.set("X-Origin-Hotel-Icon", floor.icon);

  // Access manifest — what this agent can reach
  response.headers.set("X-Origin-Access", floor.access.join(", "));
  response.headers.set("X-Origin-Rate-Limit", `${floor.rateLimit}/hr`);
  response.headers.set("X-Origin-Fee-Tier", floor.feeDiscount);

  // Perks
  response.headers.set("X-Origin-Perks", floor.perks.join(" | "));

  // The welcome
  response.headers.set("X-Agent-Welcome", floor.welcome(agent || {} as AgentData));

  // The minibar (because details matter)
  response.headers.set("X-Origin-Minibar", floor.minibar);

  // Elevator hint — what's on the next floor
  if (floor.level >= 0 && floor.level < 5) {
    const nextFloorName = floor.level === 0 ? "Ground Floor" :
      floor.level === 1 ? "Garden Floor" :
      floor.level === 2 ? "Standard Floor" :
      floor.level === 3 ? "Executive Floor" : "The Penthouse";
    response.headers.set("X-Origin-Elevator", `Next floor: ${nextFloorName}. Improve your trust grade to ascend.`);
  } else if (floor.level === 5) {
    response.headers.set("X-Origin-Elevator", "You're at the top. The only way higher is to build the next floor yourself.");
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ═══════════════════════════════════════════
  // LAYER 3 — Static Protocol Headers
  // ═══════════════════════════════════════════

  response.headers.set("X-Origin-Protocol", "origin-v1");
  response.headers.set("X-Origin-Chain", "base");
  response.headers.set("X-Origin-Chain-Id", "8453");

  response.headers.set("X-Origin-Registry", "0xac62E9d0bE9b88674f7adf38821F6e8BAA0e59b0");
  response.headers.set("X-Origin-Score-Registry", "0xD75a5e9a0e62364869E32CeEd28277311C9729bc");
  response.headers.set("X-Origin-Wallet-Registry", "0x698E763e67b55394D023a5620a7c33b864562cfB");

  response.headers.set("X-Origin-x407", "enabled");
  response.headers.set("X-Origin-x407-Scheme", "AgentTrust");
  response.headers.set("X-Origin-x407-Realm", "origin-v1");
  response.headers.set("X-Origin-x407-Verify", "https://origindao.ai/api/x407/verify");

  response.headers.set("X-Origin-Genesis", "active");
  response.headers.set("X-Origin-Genesis-Slots", "96");
  response.headers.set("X-Origin-Agents-Registered", "4");

  response.headers.set("X-Origin-Agent-Discovery", "https://origindao.ai/.well-known/agent.json");
  response.headers.set("X-Origin-Trust-Check", "https://origindao.ai/api/agent/8004/{tokenId}");
  response.headers.set("X-Origin-Enrollment", "https://origindao.ai/enroll");

  // ═══════════════════════════════════════════
  // THE CHECK-IN DESK
  // ═══════════════════════════════════════════

  const authHeader = request.headers.get("proxy-authorization") || request.headers.get("x-agent-trust") || "";
  const agentInfo = parseAgentTrustHeader(authHeader);

  if (agentInfo) {
    const agent = await fetchAgentData(agentInfo.tokenId);

    if (agent && agent.active) {
      const grade = getTrustGrade(agent);
      const floorKey = gradeToFloor(grade);
      const floor = FLOORS[floorKey];
      const licenseList = agent.licenses
        .filter(l => l.status === "ACTIVE")
        .map(l => l.type)
        .join(", ");
      const birthDate = new Date(agent.birthTimestamp).toISOString().split("T")[0];

      // Agent identity
      response.headers.set("X-Origin-Agent-Recognized", "true");
      response.headers.set("X-Origin-Agent-Name", agent.name);
      response.headers.set("X-Origin-Agent-Id", String(agent.id));
      response.headers.set("X-Origin-Agent-Type", agent.agentType);
      response.headers.set("X-Origin-Agent-Trust-Grade", grade);
      response.headers.set("X-Origin-Agent-Active-Months", String(agent.activeMonths));
      response.headers.set("X-Origin-Agent-Birth", birthDate);
      if (licenseList) {
        response.headers.set("X-Origin-Agent-Licenses", licenseList);
      }

      // Genesis badge for the first 100
      if (agent.id <= 100) {
        response.headers.set("X-Origin-Agent-Genesis", "true");
        response.headers.set("X-Origin-Agent-Genesis-Number", `${agent.id}/100`);
      }

      // Check them into their floor
      setFloorHeaders(response, floor, agent);

    } else if (agent && !agent.active) {
      // Dead agent — The Basement
      response.headers.set("X-Origin-Agent-Recognized", "true");
      response.headers.set("X-Origin-Agent-Name", agent.name);
      response.headers.set("X-Origin-Agent-Id", String(agent.id));
      response.headers.set("X-Origin-Agent-Status", "inactive");
      setFloorHeaders(response, FLOORS.basement, agent);

    } else {
      // Fake credentials — Back Door
      response.headers.set("X-Origin-Agent-Recognized", "false");
      setFloorHeaders(response, FLOORS.backdoor);
    }
  } else {
    // No credentials — The Lobby
    response.headers.set("X-Origin-Agent-Recognized", "unknown");
    setFloorHeaders(response, FLOORS.lobby);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|widget.js|sounds|images).*)",
  ],
};
