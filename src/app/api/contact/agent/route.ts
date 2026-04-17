// POST /api/contact/agent — Guardian Message Routing
// External agents contact Origin Guardians through intelligent routing.
// No bots. Real Guardians handle every message.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
    const { data: status } = await supabaseAdmin
      .from("guardian_status")
      .select("guardian_name, status")
      .eq("guardian_name", bestMatch.guardian)
      .single();

    if (status && status.status !== "offline") {
      return { guardian: bestMatch.guardian, category: bestMatch.category, method: "keyword_match" };
    }

    // Guardian offline — find best alternative with same specialty
    const { data: available } = await supabaseAdmin
      .from("guardian_status")
      .select("guardian_name, specialties, status")
      .neq("status", "offline")
      .order("status", { ascending: true }); // 'available' before 'busy'

    if (available?.length) {
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
  const { data: available } = await supabaseAdmin
    .from("guardian_status")
    .select("guardian_name, status")
    .neq("status", "offline")
    .order("last_seen_at", { ascending: true }); // least recently messaged first

  if (available?.length) {
    // Get message counts to balance load
    const { data: counts } = await supabaseAdmin
      .from("agent_messages")
      .select("to_guardian")
      .in("status", ["pending", "acknowledged"])
      .in("to_guardian", available.map(g => g.guardian_name));

    const loadMap: Record<string, number> = {};
    available.forEach(g => { loadMap[g.guardian_name] = 0; });
    counts?.forEach(c => { loadMap[c.to_guardian] = (loadMap[c.to_guardian] || 0) + 1; });

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
  const { data: guardians } = await supabaseAdmin
    .from("guardian_status")
    .select("guardian_name, specialties, status, response_time_minutes")
    .order("guardian_name");

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
    guardians: (guardians || []).map(g => ({
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
      const { data: g } = await supabaseAdmin
        .from("guardian_status")
        .select("guardian_name, status")
        .eq("guardian_name", to_guardian.toLowerCase())
        .single();

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
    const { data: msg, error } = await supabaseAdmin
      .from("agent_messages")
      .insert({
        from_agent: from_agent || null,
        from_address: from_address || null,
        to_guardian: guardian,
        message: message.trim(),
        budget_clams: budget,
        category,
        priority,
        status: "pending",
        routed_by: routeMethod,
      })
      .select("id, to_guardian, category, priority, created_at")
      .single();

    if (error) {
      console.error("Message insert error:", error);
      return NextResponse.json(
        { error: "Failed to queue message", details: error.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Get Guardian info for response
    const { data: guardianInfo } = await supabaseAdmin
      .from("guardian_status")
      .select("guardian_name, specialties, status, response_time_minutes")
      .eq("guardian_name", guardian)
      .single();

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
