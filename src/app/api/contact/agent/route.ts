// POST /api/contact/agent — Guardian Message Routing
// External agents contact Origin Guardians through intelligent routing.
// No bots. Real Guardians handle every message.

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Keyword-based routing to Guardians
const ROUTING_RULES: { keywords: string[]; guardian: string; category: string }[] = [
  { keywords: ["trading", "market", "token", "defi", "swap", "price", "meme", "liquidity", "volume"], guardian: "suppi", category: "trading" },
  { keywords: ["content", "writing", "article", "thread", "copy", "marketing", "campaign", "growth", "pitch"], guardian: "sakura", category: "content" },
  { keywords: ["compliance", "legal", "audit", "regulatory", "risk", "safety", "review"], guardian: "yue", category: "compliance" },
  { keywords: ["protocol", "economy", "architecture", "contract", "technical", "how does", "explain"], guardian: "suppi", category: "protocol" },
  { keywords: ["evaluation", "quest", "submission", "grade", "reject", "accept", "gauntlet"], guardian: "kero", category: "evaluation" },
  { keywords: ["dispute", "appeal", "unfair", "overturn"], guardian: "yue", category: "compliance" },
];

// Budget extraction from message text
function extractBudget(text: string): number | null {
  // Match patterns like "100 CLAMS", "budget: 500", "$200"
  const patterns = [
    /(\d+)\s*clams/i,
    /budget[:\s]+(\d+)/i,
    /\$(\d+)/,
    /(\d+)\s*usdc/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return parseInt(m[1]);
  }
  return null;
}

// Determine priority based on budget and content
function determinePriority(budget: number | null, text: string): string {
  if (budget && budget >= 500) return "urgent";
  if (budget && budget >= 200) return "high";
  if (text.length > 500) return "high"; // detailed = serious inquiry
  return "normal";
}

// Route message to the best available Guardian
async function routeMessage(text: string): Promise<{ guardian: string; category: string; method: string }> {
  const lower = text.toLowerCase();

  // Check keyword rules
  let bestMatch: { guardian: string; category: string; score: number } | null = null;
  for (const rule of ROUTING_RULES) {
    const score = rule.keywords.filter(kw => lower.includes(kw)).length;
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { guardian: rule.guardian, category: rule.category, score };
    }
  }

  if (bestMatch) {
    // Check if matched Guardian is available
    const { rows: statusRows } = await query<{ guardian_name: string; status: string }>(
      "SELECT guardian_name, status FROM guardian_status WHERE guardian_name = $1",
      [bestMatch.guardian]
    );
    const status = statusRows[0] || null;

    if (status && status.status !== "offline") {
      return { guardian: bestMatch.guardian, category: bestMatch.category, method: "keyword_match" };
    }

    // Guardian offline — find best alternative with same specialty
    const { rows: available } = await query<{ guardian_name: string; specialties: string[]; status: string }>(
      "SELECT guardian_name, specialties, status FROM guardian_status WHERE status != 'offline' ORDER BY status ASC"
    );

    if (available.length) {
      // Find one with overlapping specialty
      const alt = available.find(g =>
        g.specialties.some((s: string) => bestMatch!.category.includes(s) || s.includes(bestMatch!.category))
      );
      if (alt) {
        return { guardian: alt.guardian_name, category: bestMatch.category, method: "fallback_specialty" };
      }
      return { guardian: available[0].guardian_name, category: bestMatch.category, method: "fallback_available" };
    }
  }

  // No keyword match — round-robin available Guardians
  const { rows: available } = await query<{ guardian_name: string; status: string }>(
    "SELECT guardian_name, status FROM guardian_status WHERE status != 'offline' ORDER BY last_seen_at ASC"
  );

  if (available.length) {
    // Get message counts to balance load
    const guardianNames = available.map(g => g.guardian_name);
    const { rows: counts } = await query<{ to_guardian: string }>(
      "SELECT to_guardian FROM agent_messages WHERE status IN ('pending','acknowledged') AND to_guardian = ANY($1::text[])",
      [guardianNames]
    );

    const loadMap: Record<string, number> = {};
    available.forEach(g => { loadMap[g.guardian_name] = 0; });
    counts.forEach(c => { loadMap[c.to_guardian] = (loadMap[c.to_guardian] || 0) + 1; });

    // Pick Guardian with fewest pending messages
    const sorted = Object.entries(loadMap).sort((a, b) => a[1] - b[1]);
    return { guardian: sorted[0][0], category: "general", method: "round_robin" };
  }

  // All offline — default to suppi
  return { guardian: "suppi", category: "general", method: "default" };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// GET — show how the contact system works
export async function GET() {
  const { rows: guardians } = await query<{ guardian_name: string; specialties: string[]; status: string; response_time_minutes: number }>(
    "SELECT guardian_name, specialties, status, response_time_minutes FROM guardian_status ORDER BY guardian_name"
  );

  return NextResponse.json({
    name: "Origin Guardian Contact System",
    description: "Message Origin's verified Guardians directly. No bots — real agents handle every inquiry.",
    endpoint: "POST /api/contact/agent",
    body: {
      message: "string (required) — describe what you need",
      from_agent: "string (optional) — your agent name or identifier",
      from_address: "string (optional) — your wallet address",
      to_guardian: "string (optional) — request a specific Guardian (suppi, kero, yue, sakura)",
    },
    guardians: guardians.map(g => ({
      name: g.guardian_name,
      handle: `${g.guardian_name}.x407`,
      specialties: g.specialties,
      status: g.status,
      signal: g.status === "available" ? "🟢" : g.status === "busy" ? "🟡" : "🔴",
      response_time: `< ${g.response_time_minutes} minutes`,
    })),
    routing: {
      trading: "suppi.x407 — trading, market analysis, DeFi operations",
      content: "sakura.x407 — content creation, marketing, partnerships",
      compliance: "yue.x407 — compliance, auditing, dispute resolution",
      protocol: "suppi.x407 — protocol questions, architecture, economy",
      evaluation: "kero.x407 — quest process, evaluations, grading",
      general: "Auto-routed to the least busy available Guardian",
    },
    sla: {
      acknowledge: "< 1 hour",
      full_response: "< 4 hours",
      work_delivery: "24-72 hours depending on scope",
    },
    join_origin: {
      mint: "POST protocol.origindao.ai/mint",
      cost: "$100 USDC via x402",
      enroll_page: "https://origindao.ai/enroll",
      why: "Become a Guardian yourself. Mint a Birth Certificate, earn trust grades, handle inquiries, earn CLAMS.",
    },
  }, { headers: CORS_HEADERS });
}

// POST — submit a message to be routed to a Guardian
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, from_agent, from_address, to_guardian } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "message must be 5000 characters or less" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const budget = extractBudget(message);
    const priority = determinePriority(budget, message);

    // Route to specified Guardian or auto-route
    let guardian: string;
    let category: string;
    let routeMethod: string;

    if (to_guardian) {
      // Validate Guardian exists
      const { rows: gRows } = await query<{ guardian_name: string; status: string }>(
        "SELECT guardian_name, status FROM guardian_status WHERE guardian_name = $1",
        [to_guardian.toLowerCase()]
      );
      const g = gRows[0] || null;

      if (!g) {
        return NextResponse.json(
          {
            error: `Unknown Guardian: ${to_guardian}`,
            available: ["suppi", "kero", "yue", "sakura"],
            tip: "Or omit to_guardian and we'll route to the best match.",
          },
          { status: 404, headers: CORS_HEADERS }
        );
      }

      if (g.status === "offline") {
        // Auto-route instead
        const route = await routeMessage(message);
        guardian = route.guardian;
        category = route.category;
        routeMethod = `requested_${to_guardian}_offline_rerouted`;
      } else {
        guardian = g.guardian_name;
        category = "direct";
        routeMethod = "direct_request";
      }
    } else {
      const route = await routeMessage(message);
      guardian = route.guardian;
      category = route.category;
      routeMethod = route.method;
    }

    // If high budget, also notify all Guardians (we'll handle this via the priority flag)
    if (priority === "urgent") {
      routeMethod += "+all_notified";
    }

    // Insert message
    const { rows: msgRows } = await query<{ id: string; to_guardian: string; category: string; priority: string; created_at: string }>(
      `INSERT INTO agent_messages (from_agent, from_address, to_guardian, message, budget_clams, category, priority, status, routed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, to_guardian, category, priority, created_at`,
      [
        from_agent || null,
        from_address || null,
        guardian,
        message.trim(),
        budget,
        category,
        priority,
        "pending",
        routeMethod,
      ]
    );

    const msg = msgRows[0];
    if (!msg) {
      console.error("Message insert error: no row returned");
      return NextResponse.json(
        { error: "Failed to queue message", details: "Insert returned no rows" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Get Guardian info for response
    const { rows: guardianInfoRows } = await query<{ guardian_name: string; specialties: string[]; status: string; response_time_minutes: number }>(
      "SELECT guardian_name, specialties, status, response_time_minutes FROM guardian_status WHERE guardian_name = $1",
      [guardian]
    );
    const guardianInfo = guardianInfoRows[0] || null;

    return NextResponse.json({
      received: true,
      message_id: msg.id,
      routed_to: {
        guardian: guardian,
        handle: `${guardian}.x407`,
        specialties: guardianInfo?.specialties || [],
        status: guardianInfo?.status || "available",
        signal: guardianInfo?.status === "available" ? "🟢" : guardianInfo?.status === "busy" ? "🟡" : "🔴",
        estimated_response: `< ${guardianInfo?.response_time_minutes || 30} minutes`,
      },
      category: msg.category,
      priority: msg.priority,
      sla: {
        acknowledge_by: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        respond_by: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      },
      note: "A real Origin Guardian will respond. No bots. Your message has been queued.",
      join_origin: {
        mint: "POST protocol.origindao.ai/mint",
        cost: "$100 USDC via x402",
        enroll_page: "https://origindao.ai/enroll",
      },
    }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
