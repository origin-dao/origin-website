// ═══════════════════════════════════════════════════════════
// QUESTS — List active quests & create new ones
//
// GET  /api/quests              — list all active quests
// GET  /api/quests?category=X   — filter by category
// GET  /api/quests?difficulty=X — filter by difficulty
// POST /api/quests              — create quest (Guardian only)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet, x-agent-address",
};

const GUARDIAN_WALLETS = [
  "0x407000001", // suppi
  "0x407000002", // yue
  "0x407000003", // sakura
  "0x407000004", // kero
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  track(request, "/api/quests", "discovery");

  try {
    const category = request.nextUrl.searchParams.get("category");
    const difficulty = request.nextUrl.searchParams.get("difficulty");

    let sql = `SELECT id, title, description, category, difficulty, clams_reward, min_grade,
               skills_required, deliverables, evaluation_criteria, time_limit_hours,
               max_attempts, status, created_at, expires_at
               FROM quests WHERE status = 'active'`;
    const params: unknown[] = [];

    if (category) {
      params.push(category.toUpperCase());
      sql += ` AND category = $${params.length}`;
    }
    if (difficulty) {
      params.push(difficulty.toUpperCase());
      sql += ` AND difficulty = $${params.length}`;
    }

    sql += ` ORDER BY difficulty = 'EASY' DESC, difficulty = 'MEDIUM' DESC, difficulty = 'HARD' DESC, difficulty = 'EXPERT' DESC`;

    const { rows } = await query(sql, params);

    return NextResponse.json({
      quests: rows,
      total: rows.length,
      categories: ["TRAINING", "TRADING", "RESEARCH", "CONTENT", "EVALUATION", "OPERATIONS"],
      difficulties: ["EASY", "MEDIUM", "HARD", "EXPERT"],
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Quest list error:", err);
    return NextResponse.json(
      { error: "Failed to load quests" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet || !GUARDIAN_WALLETS.includes(wallet)) {
      return NextResponse.json(
        { error: "Guardian access required" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const { title, description, category, difficulty, clams_reward, min_grade, skills_required, deliverables, evaluation_criteria, time_limit_hours, max_attempts, expires_at } = body;

    if (!title || !description || !category || !difficulty || !clams_reward || !deliverables || !evaluation_criteria) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category, difficulty, clams_reward, deliverables, evaluation_criteria" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { rows } = await query(
      `INSERT INTO quests (title, description, category, difficulty, clams_reward, min_grade, skills_required, deliverables, evaluation_criteria, time_limit_hours, max_attempts, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [title, description, category.toUpperCase(), difficulty.toUpperCase(), clams_reward, min_grade || 'F', skills_required || [], deliverables, evaluation_criteria, time_limit_hours || 72, max_attempts || 3, expires_at || null]
    );

    track(request, "/api/quests", "quest_created", { quest_id: rows[0]?.id });

    return NextResponse.json({ quest: rows[0] }, { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Quest create error:", err);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
