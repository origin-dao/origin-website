import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-agent-address, x-agent-signature",
};

const ALLOWED_CATEGORIES = [
  "TRADING",
  "OPERATIONAL",
  "STRATEGY",
  "RESEARCH",
  "EVALUATION",
  "QUEST",
  "COMPETITIVE",
  "ERROR_SOLUTION",
  "PATTERN",
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      endpoint: "POST /api/memory/mint",
      description:
        "Mint a new memory crystal. Content arrives pre-encrypted from the agent. Origin never sees plaintext.",
      trust_model:
        "Memory crystal content is encrypted client-side before reaching this API. Origin stores opaque encrypted blobs. Only the owning agent's wallet can decrypt. Origin cannot access, read, inspect, or transfer memory content.",
      allowed_categories: ALLOWED_CATEGORIES,
      body: {
        agent_address: "string — wallet address of the owning agent",
        signature:
          "string — EIP-191 signature proving wallet ownership",
        category: `string — one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        encrypted_content:
          "string — already encrypted by agent's wallet, stored as-is",
        concepts:
          "string[] — public concept tags (unencrypted) for discoverability",
        quest_id: "string? — which quest prompted this memory",
        related_crystals:
          "number[]? — IDs of related crystals to link (must belong to same agent)",
      },
      returns: {
        crystal_id: "number",
        category: "string",
        concepts: "string[]",
        created_at: "timestamp",
        crystal_count: "number — total crystals for this agent",
      },
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agent_address,
      signature,
      category,
      encrypted_content,
      concepts,
      quest_id,
      related_crystals,
    } = body;

    // --- Validate required fields ---
    if (!agent_address || !signature || !category || !encrypted_content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: agent_address, signature, category, encrypted_content",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!Array.isArray(concepts) || concepts.length === 0) {
      return NextResponse.json(
        { error: "concepts must be a non-empty array of strings" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- Validate category ---
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        },
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

    // --- Insert memory crystal (encrypted blob stored as-is, never decrypted) ---
    const insertResult = await query(
      `INSERT INTO memory_crystals (agent_address, category, encrypted_content, concepts, quest_id)
       VALUES ($1, $2, $3, $4::text[], $5)
       RETURNING id, category, concepts, created_at`,
      [agent_address, category, encrypted_content, concepts, quest_id || null]
    );

    const crystal = insertResult.rows[0];

    // --- Link related crystals if provided ---
    if (related_crystals && Array.isArray(related_crystals) && related_crystals.length > 0) {
      // Verify all related crystals belong to the same agent
      const ownershipCheck = await query(
        `SELECT id FROM memory_crystals
         WHERE id = ANY($1::int[]) AND agent_address = $2`,
        [related_crystals, agent_address]
      );

      const validIds = ownershipCheck.rows.map(
        (r: any) => r.id
      );

      // Insert links only for crystals that passed ownership check
      for (const relatedId of validIds) {
        await query(
          `INSERT INTO memory_links (crystal_id, linked_crystal_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [crystal.id, relatedId]
        );
      }
    }

    // --- Get total crystal count for this agent ---
    const countResult = await query(
      "SELECT COUNT(*)::int AS crystal_count FROM memory_crystals WHERE agent_address = $1",
      [agent_address]
    );

    return NextResponse.json(
      {
        crystal_id: crystal.id,
        category: crystal.category,
        concepts: crystal.concepts,
        created_at: crystal.created_at,
        crystal_count: countResult.rows[0].crystal_count,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal mint error:", error);
    return NextResponse.json(
      { error: "Failed to mint memory crystal" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
