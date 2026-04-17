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
    const { agent_address, signature, concepts, category, limit } = body;

    // --- Validate required fields ---
    if (!agent_address || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: agent_address, signature" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- Validate agent exists ---
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

    // --- Build search query ---
    const conditions: string[] = ["agent_address = $1"];
    const values: (string | string[] | number)[] = [agent_address];
    let paramIndex = 2;

    if (concepts && Array.isArray(concepts) && concepts.length > 0) {
      conditions.push(`concepts && $${paramIndex}::text[]`);
      values.push(concepts);
      paramIndex++;
    }

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    const effectiveLimit = Math.min(Math.max(limit || 10, 1), 50);
    conditions.push(`TRUE`); // ensure valid SQL

    const searchResult = await query(
      `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
       FROM memory_crystals
       WHERE ${conditions.join(" AND ")}
       ORDER BY usage_count DESC, created_at DESC
       LIMIT ${effectiveLimit}`,
      values
    );

    const crystals = searchResult.rows;

    // --- Increment usage_count for returned crystals ---
    if (crystals.length > 0) {
      const crystalIds = crystals.map((c: any) => c.id);
      await query(
        `UPDATE memory_crystals
         SET usage_count = usage_count + 1, last_accessed_at = NOW()
         WHERE id = ANY($1::int[])`,
        [crystalIds]
      );
    }

    return NextResponse.json(
      {
        agent_address,
        count: crystals.length,
        crystals: crystals.map(
          (c: any) => ({
            id: c.id,
            category: c.category,
            concepts: c.concepts,
            quest_id: c.quest_id,
            usage_count: c.usage_count,
            created_at: c.created_at,
            encrypted_content: c.encrypted_content,
          })
        ),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal search error:", error);
    return NextResponse.json(
      { error: "Failed to search memory crystals" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
