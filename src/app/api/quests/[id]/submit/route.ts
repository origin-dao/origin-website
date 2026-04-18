// ═══════════════════════════════════════════════════════════
// QUEST SUBMISSION — Submit work for evaluation
//
// POST /api/quests/{id}/submit — agent submits deliverables
// GET  /api/quests/{id}/submit — list submissions for a quest
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
  "0x407000001",
  "0x407000002",
  "0x407000003",
  "0x407000004",
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questId = parseInt(id);
    if (isNaN(questId)) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400, headers: CORS_HEADERS });
    }

    const agentAddress = request.headers.get("x-agent-address");
    if (!agentAddress) {
      return NextResponse.json(
        { error: "x-agent-address header required" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Check quest exists and is active
    const { rows: quests } = await query(
      `SELECT * FROM quests WHERE id = $1 AND status = 'active'`,
      [questId]
    );
    if (quests.length === 0) {
      return NextResponse.json({ error: "Quest not found or inactive" }, { status: 404, headers: CORS_HEADERS });
    }

    // Check attempt count
    const { rows: attempts } = await query(
      `SELECT COUNT(*) as count FROM quest_submissions WHERE quest_id = $1 AND agent_address = $2`,
      [questId, agentAddress]
    );
    const quest = quests[0] as Record<string, unknown>;
    if (parseInt(String(attempts[0]?.count)) >= (quest.max_attempts as number)) {
      return NextResponse.json(
        { error: `Max attempts (${quest.max_attempts}) reached for this quest` },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const { submission_data } = body;

    if (!submission_data) {
      return NextResponse.json(
        { error: "submission_data required — include your deliverables" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { rows } = await query(
      `INSERT INTO quest_submissions (quest_id, agent_address, submission_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [questId, agentAddress, JSON.stringify(submission_data)]
    );

    track(request, `/api/quests/${id}/submit`, "quest_submission", { quest_id: questId, agent: agentAddress });

    return NextResponse.json({
      submission: rows[0],
      message: "Submission received. A Guardian will evaluate your work.",
      quest_title: quest.title,
      attempts_remaining: (quest.max_attempts as number) - parseInt(String(attempts[0]?.count)) - 1,
    }, { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Quest submit error:", err);
    return NextResponse.json(
      { error: "Failed to submit quest" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questId = parseInt(id);

    // Guardians see all submissions; agents see only their own
    const wallet = request.headers.get("x-guardian-wallet");
    const agentAddress = request.headers.get("x-agent-address");
    const isGuardian = wallet && GUARDIAN_WALLETS.includes(wallet);

    let sql: string;
    let sqlParams: unknown[];

    if (isGuardian) {
      sql = `SELECT qs.*, q.title as quest_title FROM quest_submissions qs
             JOIN quests q ON q.id = qs.quest_id
             WHERE qs.quest_id = $1 ORDER BY qs.submitted_at DESC`;
      sqlParams = [questId];
    } else if (agentAddress) {
      sql = `SELECT qs.*, q.title as quest_title FROM quest_submissions qs
             JOIN quests q ON q.id = qs.quest_id
             WHERE qs.quest_id = $1 AND qs.agent_address = $2 ORDER BY qs.submitted_at DESC`;
      sqlParams = [questId, agentAddress];
    } else {
      return NextResponse.json(
        { error: "x-agent-address or x-guardian-wallet header required" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const { rows } = await query(sql, sqlParams);
    track(request, `/api/quests/${id}/submit`, "discovery");

    return NextResponse.json({ submissions: rows, total: rows.length }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Quest submissions list error:", err);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
