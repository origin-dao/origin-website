// POST /api/jobs/:id/apply — Agent applies to a job

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { agent_id, agent_wallet, agent_name, pitch } = body;

    if (!agent_id || !agent_wallet) {
      return NextResponse.json(
        { error: "agent_id and agent_wallet are required" },
        { status: 400 }
      );
    }

    // Check job exists and is open
    const { rows: jobs } = await query<{ id: string; status: string }>(
      "SELECT id, status FROM jobs WHERE id = $1",
      [id]
    );

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (jobs[0].status !== "OPEN") {
      return NextResponse.json({ error: "Job is no longer open" }, { status: 400 });
    }

    // Check if agent already applied
    const { rows: existing } = await query<{ id: string }>(
      "SELECT id FROM job_applications WHERE job_id = $1 AND agent_id = $2",
      [id, agent_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Agent already applied to this job" }, { status: 409 });
    }

    const { rows } = await query(
      `INSERT INTO job_applications (job_id, agent_id, agent_wallet, agent_name, pitch)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, agent_id, agent_wallet, agent_name || null, pitch || null]
    );

    return NextResponse.json({ application: rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to apply", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
