// ═══════════════════════════════════════════════════════════
// SIGNALS — Guardian priority boost system
//
// POST /api/signals/boost — Guardian boosts an opportunity
// GET  /api/signals/boost — List active signals (Guardian only)
//
// Guardians don't push commands. They boost signals.
// Agents read signals via ORIENT and decide autonomously.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
};

const GUARDIAN_MAP: Record<string, string> = {
  "0xf5eC02E4388c74c0B8107314F2a036d2f5CD61c9": "suppi",
  "0xAb02a37B86a5e56f7AEa88D04F9334960F6a21e4": "kero",
  "0xd141dCFa8FEe8838aA6e283553181b4EfEC6522c": "yue",
  "0x8Ddb0385Be205EEF978518D8535BA2Db9426dfdc": "sakura",
  // Legacy placeholder wallets
  "0x407000001": "suppi",
  "0x407000002": "yue",
  "0x407000003": "sakura",
  "0x407000004": "kero",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet || !GUARDIAN_MAP[wallet]) {
      return NextResponse.json(
        { error: "Guardian access required. Use x-guardian-wallet header." },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const guardian = GUARDIAN_MAP[wallet];
    const body = await request.json();
    const {
      target_agent,
      quest_id,
      signal_type = "quest_boost",
      priority = "normal",
      message,
      expires_hours = 72,
    } = body as {
      target_agent: string;
      quest_id?: number;
      signal_type?: string;
      priority?: string;
      message?: string;
      expires_hours?: number;
    };

    if (!target_agent) {
      return NextResponse.json(
        { error: "target_agent required (agent name or 'all')" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validTypes = ["quest_boost", "hire_flag", "arena_alert", "general"];
    if (!validTypes.includes(signal_type)) {
      return NextResponse.json(
        { error: `signal_type must be one of: ${validTypes.join(", ")}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validPriorities = ["low", "normal", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${validPriorities.join(", ")}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify target agent exists (unless broadcasting to 'all')
    if (target_agent !== "all") {
      const { rows } = await query(
        `SELECT name FROM agents WHERE LOWER(name) = LOWER($1)`,
        [target_agent]
      );
      if (rows.length === 0) {
        return NextResponse.json(
          { error: `Agent '${target_agent}' not found` },
          { status: 404, headers: CORS_HEADERS }
        );
      }
    }

    // Verify quest exists if quest_id provided
    if (quest_id) {
      const { rows } = await query(
        `SELECT id, title FROM quests WHERE id = $1 AND status = 'active'`,
        [quest_id]
      );
      if (rows.length === 0) {
        return NextResponse.json(
          { error: `Quest ${quest_id} not found or inactive` },
          { status: 404, headers: CORS_HEADERS }
        );
      }
    }

    const expiresAt = new Date(Date.now() + expires_hours * 60 * 60 * 1000).toISOString();

    const { rows } = await query(
      `INSERT INTO signals (signal_type, target_agent, quest_id, source_guardian, priority, message, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [signal_type, target_agent.toLowerCase(), quest_id || null, guardian, priority, message || null, expiresAt]
    );

    track(request, "/api/signals/boost", "quest_created", {
      guardian,
      target: target_agent,
      signal_type,
      priority,
    });

    return NextResponse.json({
      signal: rows[0],
      message: `Signal boosted. ${target_agent === "all" ? "All agents" : target_agent} will see this on their next ORIENT.`,
    }, { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Signal boost error:", err);
    return NextResponse.json(
      { error: "Failed to boost signal" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet || !GUARDIAN_MAP[wallet]) {
      return NextResponse.json(
        { error: "Guardian access required" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const { rows } = await query(
      `SELECT s.*, q.title as quest_title
       FROM signals s
       LEFT JOIN quests q ON q.id = s.quest_id
       WHERE (s.expires_at IS NULL OR s.expires_at > NOW())
       ORDER BY s.created_at DESC LIMIT 50`,
      []
    );

    track(request, "/api/signals/boost", "discovery");

    return NextResponse.json({
      signals: rows,
      total: rows.length,
      unread: rows.filter((r: Record<string, unknown>) => !r.read_at).length,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Signal list error:", err);
    return NextResponse.json(
      { error: "Failed to list signals" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
