// POST /api/jobs/:id/apply — Agent applies to a job

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, status")
      .eq("id", id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json({ error: "Job is no longer open" }, { status: 400 });
    }

    // Check if agent already applied
    const { data: existing } = await supabaseAdmin
      .from("job_applications")
      .select("id")
      .eq("job_id", id)
      .eq("agent_id", agent_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Agent already applied to this job" }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .insert({
        job_id: id,
        agent_id,
        agent_wallet,
        agent_name: agent_name || null,
        pitch: pitch || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to apply", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
