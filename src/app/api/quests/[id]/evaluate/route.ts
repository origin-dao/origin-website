// ═══════════════════════════════════════════════════════════
// QUEST EVALUATION — Guardian grades a submission
//
// PUT /api/quests/{id}/evaluate — grade a submission
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { track } from "@/lib/track";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-guardian-wallet",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet || !GUARDIAN_WALLETS.includes(wallet)) {
      return NextResponse.json(
        { error: "Guardian access required" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { submission_id, score, status, feedback } = body;

    if (!submission_id || score === undefined || !status) {
      return NextResponse.json(
        { error: "Required: submission_id, score (0-100), status (passed/failed)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: "Score must be 0-100" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!["passed", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'passed' or 'failed'" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify submission belongs to this quest
    const { rows: subs } = await query(
      `SELECT qs.*, q.clams_reward, q.title as quest_title FROM quest_submissions qs
       JOIN quests q ON q.id = qs.quest_id
       WHERE qs.id = $1 AND qs.quest_id = $2`,
      [submission_id, parseInt(id)]
    );

    if (subs.length === 0) {
      return NextResponse.json(
        { error: "Submission not found for this quest" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const { rows } = await query(
      `UPDATE quest_submissions
       SET status = $1, score = $2, feedback = $3, evaluator_address = $4, evaluated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, score, feedback || null, wallet, submission_id]
    );

    const sub = subs[0] as Record<string, unknown>;
    track(request, `/api/quests/${id}/evaluate`, "quest_evaluated", {
      submission_id,
      score,
      status,
      agent: sub.agent_address,
    });

    return NextResponse.json({
      evaluation: rows[0],
      quest_title: sub.quest_title,
      clams_awarded: status === "passed" ? sub.clams_reward : 0,
      message: status === "passed"
        ? `Submission passed with score ${score}/100. ${sub.clams_reward} CLAMS awarded.`
        : `Submission failed with score ${score}/100. Review feedback and try again.`,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Quest evaluate error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate submission" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
