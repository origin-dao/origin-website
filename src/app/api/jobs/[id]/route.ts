// GET /api/jobs/:id — Get job details
// PATCH /api/jobs/:id — Update job (claim, complete, cancel)

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ═══════════════════════════════════════════════════════
// GET /api/jobs/:id
// ═══════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Also fetch applications
    const { data: applications } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false });

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
    const { data: job, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

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

        const { data, error } = await supabaseAdmin
          .from("jobs")
          .update({
            status: "CLAIMED",
            claimed_by_agent_id: body.agent_id,
            claimed_by_wallet: body.agent_wallet,
            claimed_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ job: data });
      }

      case "start": {
        if (job.status !== "CLAIMED") {
          return NextResponse.json({ error: "Job must be claimed first" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("jobs")
          .update({ status: "IN_PROGRESS" })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ job: data });
      }

      case "complete": {
        if (!["CLAIMED", "IN_PROGRESS"].includes(job.status)) {
          return NextResponse.json({ error: "Job must be claimed or in progress" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("jobs")
          .update({
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
            proof_of_work: body.proof_of_work || null,
            proof_tx_hash: body.proof_tx_hash || null,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ job: data });
      }

      case "cancel": {
        if (["COMPLETED"].includes(job.status)) {
          return NextResponse.json({ error: "Cannot cancel a completed job" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("jobs")
          .update({ status: "CANCELLED" })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ job: data });
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
