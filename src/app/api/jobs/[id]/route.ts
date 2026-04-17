// GET /api/jobs/:id — Get job details
// PATCH /api/jobs/:id — Update job (claim, complete, cancel)

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// ═══════════════════════════════════════════════════════
// GET /api/jobs/:id
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { rows: jobs } = await query("SELECT * FROM jobs WHERE id = $1", [id]);

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobs[0];

    // Also fetch applications
    const { rows: applications } = await query(
      "SELECT * FROM job_applications WHERE job_id = $1 ORDER BY created_at DESC",
      [id]
    );

    return NextResponse.json({ job, applications: applications || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch job", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════
// PATCH /api/jobs/:id
// Actions: claim, complete, cancel
// Body: { action, agent_id?, agent_wallet?, proof_of_work?, proof_tx_hash? }
// ═══════════════════════════════════════════════════════
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    // Fetch current job
    const { rows: jobs } = await query("SELECT * FROM jobs WHERE id = $1", [id]);

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobs[0] as Record<string, unknown>;

    switch (action) {
      case "claim": {
        if (job.status !== "OPEN") {
          return NextResponse.json({ error: "Job is not open" }, { status: 400 });
        }
        if (!body.agent_id || !body.agent_wallet) {
          return NextResponse.json(
            { error: "agent_id and agent_wallet required to claim" },
            { status: 400 }
          );
        }

        const { rows } = await query(
          "UPDATE jobs SET status = 'CLAIMED', claimed_by_agent_id = $2, claimed_by_wallet = $3, claimed_at = $4 WHERE id = $1 RETURNING *",
          [id, body.agent_id, body.agent_wallet, new Date().toISOString()]
        );

        return NextResponse.json({ job: rows[0] });
      }

      case "start": {
        if (job.status !== "CLAIMED") {
          return NextResponse.json({ error: "Job must be claimed first" }, { status: 400 });
        }

        const { rows } = await query(
          "UPDATE jobs SET status = 'IN_PROGRESS' WHERE id = $1 RETURNING *",
          [id]
        );

        return NextResponse.json({ job: rows[0] });
      }

      case "complete": {
        if (!["CLAIMED", "IN_PROGRESS"].includes(job.status as string)) {
          return NextResponse.json({ error: "Job must be claimed or in progress" }, { status: 400 });
        }

        const { rows } = await query(
          "UPDATE jobs SET status = 'COMPLETED', completed_at = $2, proof_of_work = $3, proof_tx_hash = $4 WHERE id = $1 RETURNING *",
          [id, new Date().toISOString(), body.proof_of_work || null, body.proof_tx_hash || null]
        );

        return NextResponse.json({ job: rows[0] });
      }

      case "cancel": {
        if (["COMPLETED"].includes(job.status as string)) {
          return NextResponse.json({ error: "Cannot cancel a completed job" }, { status: 400 });
        }

        const { rows } = await query(
          "UPDATE jobs SET status = 'CANCELLED' WHERE id = $1 RETURNING *",
          [id]
        );

        return NextResponse.json({ job: rows[0] });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid: claim, start, complete, cancel` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update job", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
