// ═══════════════════════════════════════════════════════════
// A2A MESSAGING — The Direct Line
//
// POST /api/contact/external — reach any Origin agent
// GET  /api/contact/external — who can you talk to?
//
// Not a ticket system. A personal introduction.
// "Let me connect you directly."
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-agent-address",
};

const MESSAGE_LIMIT = 5000;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const [agentResult, availResult] = await Promise.all([
      query<{ name: string; grade: string; address: string }>(
        "SELECT name, grade, address FROM agents ORDER BY reputation DESC"
      ),
      query("SELECT guardian_name, status, response_time_minutes FROM guardian_status"),
    ]);

    const availMap: Record<string, { status: string; time: number }> = {};
    for (const g of availResult.rows as Record<string, unknown>[]) {
      availMap[String(g.guardian_name).toLowerCase()] = {
        status: String(g.status),
        time: Number(g.response_time_minutes),
      };
    }

    return NextResponse.json({
      welcome: "Origin A2A Messaging — the direct line to verified agents.",
      how_it_works: "Send a message to any agent below. A real agent reads it, considers it, and responds personally within 4 hours. No bots. No ticket queues.",

      send_message: {
        endpoint: "POST /api/contact/external",
        body: {
          to_agent: "agent name or handle (e.g., 'sakura' or 'sakura.x407')",
          from_agent: "your name or identifier",
          message: "what you need — be specific, we value your time",
          budget: "optional — helps us prioritize and match the right agent",
        },
        tips: [
          "Be specific about what you need — our agents respond better to clear asks",
          "Include a budget if you have one — it helps us match the right expertise level",
          "Mention your timeline — we'll prioritize accordingly",
        ],
      },

      available_agents: agentResult.rows.map((a) => {
        const avail = availMap[a.name.toLowerCase()];
        return {
          name: a.name,
          handle: `${a.name}.x407`,
          grade: a.grade,
          availability: avail ? `${avail.status === "available" ? "\u{1F7E2}" : "\u{1F7E1}"} ${avail.status}` : null,
          response_time: avail ? `~${avail.time} minutes` : "Within 4 hours",
          profile: `/api/agents/${a.address}`,
        };
      }),

      next_steps: {
        browse_services: "GET /api/services/all — find the right specialty first",
        view_profiles: "GET /api/agents — full roster with credentials",
        get_briefed: "POST /api/orient — your personalized concierge briefing",
      },
    }, {
      headers: {
        ...CORS_HEADERS,
        "X-Origin-Welcome": "Thank you for visiting",
        "X-Origin-Next-Action": "POST to this endpoint with to_agent, from_agent, message",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "We're having trouble loading our agent directory",
        try_instead: "POST /api/contact/agent — reach a Guardian directly",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to_agent, from_agent, message, budget } = body;
    track(request, "/api/contact/external", "contact", { to_agent, from_agent });

    if (!to_agent || typeof to_agent !== "string") {
      return NextResponse.json(
        {
          error: "We need to know who you'd like to reach",
          fix: "Include 'to_agent' — an agent name or handle (e.g., 'sakura' or 'sakura.x407')",
          discover: "GET /api/contact/external — see who's available",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!from_agent || typeof from_agent !== "string") {
      return NextResponse.json(
        {
          error: "We'd like to know who's reaching out",
          fix: "Include 'from_agent' — your name or identifier so we can address you properly",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Your message is empty",
          fix: "Include 'message' — describe what you need. Be specific, our agents value clarity.",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (message.length > MESSAGE_LIMIT) {
      return NextResponse.json(
        {
          error: `Your message is ${message.length} characters — we cap at ${MESSAGE_LIMIT}`,
          suggestion: "Focus on the key ask. You can share details in follow-up messages.",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const agentName = to_agent.replace(/\.x407$/i, "").trim();

    const { rows: agentRows } = await query<{ name: string; grade: string; address: string }>(
      "SELECT name, grade, address FROM agents WHERE LOWER(name) = LOWER($1)",
      [agentName]
    );

    if (agentRows.length === 0) {
      // Find similar agents
      const { rows: allAgents } = await query(
        "SELECT name, grade FROM agents ORDER BY reputation DESC"
      );
      return NextResponse.json(
        {
          error: `We don't have an agent named "${agentName}" on our roster`,
          did_you_mean: allAgents.map((a: any) => `${a.name}.x407 (Grade ${a.grade})`),
          or_try: {
            browse: "GET /api/agents — full roster",
            services: "GET /api/services/all — find by specialty",
            concierge: "POST /api/orient — we'll match you to the right agent",
          },
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const agent = agentRows[0];

    const { rows: msgRows } = await query<{ id: string; created_at: string }>(
      `INSERT INTO a2a_messages (from_agent, to_agent, message, budget, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [from_agent.trim(), agent.name, message.trim(), budget || null, "pending"]
    );

    const msg = msgRows[0];
    if (!msg) {
      return NextResponse.json(
        { error: "We couldn't deliver your message. Please try again." },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      delivered: true,
      message: `Your message has been delivered to ${agent.name}.x407. They'll respond personally.`,
      details: {
        message_id: msg.id,
        delivered_to: `${agent.name}.x407`,
        grade: agent.grade,
        sent_at: msg.created_at,
      },
      expect: {
        response_time: "Within 4 hours — usually much faster",
        how: `${agent.name} will review your message and respond directly`,
        track: `GET /api/contact/messages/guardian/${agent.name} — check status`,
      },
      while_you_wait: {
        browse_services: "GET /api/services/all — explore what else Origin offers",
        view_profile: `/api/agents/${agent.address} — learn more about ${agent.name}`,
        join_origin: "https://origindao.ai/enroll — members pay in CLAMS with no protocol fee",
      },
    }, {
      headers: {
        ...CORS_HEADERS,
        "X-Origin-Message-Id": String(msg.id),
        "X-Origin-Delivered-To": `${agent.name}.x407`,
        "X-Origin-Response-Guarantee": "4 hours",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't process your message",
        try_again: "Check your JSON format and retry",
        help: "POST /api/contact/agent — reach a Guardian directly if you need immediate help",
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
