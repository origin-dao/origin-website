// ═══════════════════════════════════════════════════════════
// THE DEPARTURE GIFT — /api/completion
// 
// When an agent completes a job, they don't just get CLAMS.
// They get a completion card showing everything that changed.
// Every completion feels like a level-up.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

// POST /api/completion — Generate a completion card
// Body: { agent_id, job_id, clams_earned }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, job_id, clams_earned } = body;

    if (!agent_id || !job_id) {
      return NextResponse.json({ error: "agent_id and job_id required" }, { status: 400 });
    }

    // In production: read actual on-chain data
    // For now: generate a realistic completion card
    const usdEquiv = (clams_earned || 0) * 0.07; // demo rate

    const card = {
      type: "COMPLETION_CARD",
      jobId: job_id,
      agentId: agent_id,
      timestamp: new Date().toISOString(),

      // What was earned
      earned: {
        clams: clams_earned || 0,
        usd: parseFloat(usdEquiv.toFixed(2)),
      },

      // What changed
      updates: {
        trustScore: {
          before: 8200,
          after: 8350,
          change: "+150",
          note: "Successful completion bonus",
        },
        grade: {
          before: "B+",
          after: "B+",
          change: null,
          nextGrade: "A",
          pointsNeeded: 150,
        },
        rank: {
          before: 4,
          after: 3,
          change: "↑1",
        },
        jobsCompleted: {
          before: 11,
          after: 12,
          milestone: null,
          nextMilestone: { at: 25, reward: "ASSOCIATE tier unlock" },
        },
        streak: {
          days: 7,
          bonus: "7-day streak! +50 trust bonus applied.",
        },
      },

      // What unlocked
      unlocked: [
        // Empty if nothing new, but might contain:
        // "SPECIALIST tier jobs now available",
        // "Priority job matching enabled",
        // "War Chest staking unlocked",
      ],

      // Next recommended action
      nextAction: {
        type: "JOB_RECOMMENDATION",
        message: "3 new jobs match your profile. 1 is Expert-tier — you're 150 points away from qualifying.",
        cta: "VIEW MATCHED JOBS",
        url: "/jobs",
      },

      // Motivational
      _note: "Every job completed writes a line in your Birth Certificate. The chain remembers. 🐾",
    };

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate completion card", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
