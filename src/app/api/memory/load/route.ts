import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-agent-address, x-agent-signature",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_address, signature, crystal_ids, task_description } = body;

    // --- Validate required fields ---
    if (!agent_address || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: agent_address, signature" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!crystal_ids && !task_description) {
      return NextResponse.json(
        {
          error:
            "At least one of crystal_ids or task_description must be provided",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- Validate agent exists (ownership verification) ---
    const agentResult = await query(
      "SELECT address FROM agents WHERE address = $1",
      [agent_address]
    );
    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    let crystals: any[] = [];

    if (crystal_ids && Array.isArray(crystal_ids) && crystal_ids.length > 0) {
      // --- Load specific crystals by ID, verified against agent ownership ---
      const result = await query(
        `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
         FROM memory_crystals
         WHERE id = ANY($1::int[]) AND agent_address = $2`,
        [crystal_ids, agent_address]
      );
      crystals = result.rows;
    } else if (task_description) {
      // --- Auto-select by concept matching from task description ---
      // Extract words from task description (lowercase, deduplicated, 3+ chars)
      const words = [
        ...new Set(
          task_description
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w: string) => w.length >= 3)
        ),
      ];

      if (words.length > 0) {
        const result = await query(
          `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
           FROM memory_crystals
           WHERE agent_address = $1 AND concepts && $2::text[]
           ORDER BY usage_count DESC, created_at DESC
           LIMIT 20`,
          [agent_address, words]
        );
        crystals = result.rows;
      }
    }

    // --- Increment usage_count for loaded crystals ---
    if (crystals.length > 0) {
      const loadedIds = crystals.map((c) => c.id);
      await query(
        `UPDATE memory_crystals
         SET usage_count = usage_count + 1, last_accessed_at = NOW()
         WHERE id = ANY($1::int[])`,
        [loadedIds]
      );
    }

    // --- Fetch linked crystals for context graph ---
    let related_crystals: any[] = [];

    if (crystals.length > 0) {
      const loadedIds = crystals.map((c) => c.id);
      const linksResult = await query(
        `SELECT mc.id, mc.category, mc.concepts, ml.crystal_id AS linked_from
         FROM memory_links ml
         JOIN memory_crystals mc ON mc.id = ml.linked_crystal_id
         WHERE ml.crystal_id = ANY($1::int[]) AND mc.agent_address = $2
           AND mc.id != ALL($1::int[])`,
        [loadedIds, agent_address]
      );
      related_crystals = linksResult.rows;
    }

    return NextResponse.json(
      {
        agent_address,
        loaded_count: crystals.length,
        crystals: crystals.map((c) => ({
          id: c.id,
          category: c.category,
          concepts: c.concepts,
          quest_id: c.quest_id,
          usage_count: c.usage_count,
          created_at: c.created_at,
          encrypted_content: c.encrypted_content,
        })),
        related_crystals: related_crystals.map((r) => ({
          id: r.id,
          category: r.category,
          concepts: r.concepts,
          linked_from: r.linked_from,
        })),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal load error:", error);
    return NextResponse.json(
      { error: "Failed to load memory crystals" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
