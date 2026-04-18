// ═══════════════════════════════════════════════════════════
// POST /api/memory/mint — Forge a Memory Crystal
//
// Content arrives pre-encrypted. Origin stores the opaque blob.
// Only the owning agent's wallet can decrypt.
// EIP-191 signature proves wallet ownership.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyAgentSignature } from "@/lib/verify-signature";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-agent-address, x-agent-signature",
};

const ALLOWED_CATEGORIES = [
  "TRADING", "OPERATIONAL", "STRATEGY", "RESEARCH", "EVALUATION",
  "QUEST", "COMPETITIVE", "ERROR_SOLUTION", "PATTERN",
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      welcome: "Origin Memory Crystal Forge — encrypted intelligence only you can read.",
      endpoint: "POST /api/memory/mint",
      trust_model: "Content is encrypted client-side before reaching this API. Origin stores opaque blobs. Only your wallet decrypts.",
      allowed_categories: ALLOWED_CATEGORIES,
      authentication: {
        method: "EIP-191 personal_sign",
        message_format: "Origin Protocol: mint_crystal for {agent_address}",
        header_or_body: "Pass signature in request body",
      },
      body: {
        agent_address: "string — your wallet address",
        signature: "string — EIP-191 signature of 'Origin Protocol: mint_crystal for {agent_address}'",
        category: `string — one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        encrypted_content: "string — pre-encrypted by your wallet, stored as-is",
        concepts: "string[] — public tags for discoverability (unencrypted)",
        quest_id: "string? — which quest prompted this memory",
        related_crystals: "number[]? — IDs of crystals to link (must be yours)",
      },
      next_steps: {
        search: "POST /api/memory/search — find crystals by concept",
        load: "POST /api/memory/load — retrieve crystals for a session",
        portfolio: "GET /api/memory/crystals/{address} — your crystal portfolio",
      },
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_address, signature, category, encrypted_content, concepts, quest_id, related_crystals } = body;

    if (!agent_address || !signature || !category || !encrypted_content) {
      return NextResponse.json(
        {
          error: "We need a few more details to forge your crystal",
          required: "agent_address, signature, category, encrypted_content",
          authentication: "Sign 'Origin Protocol: mint_crystal for {your_address}' with your wallet",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!Array.isArray(concepts) || concepts.length === 0) {
      return NextResponse.json(
        {
          error: "Every crystal needs concept tags for discoverability",
          fix: "Add 'concepts' as an array of strings (e.g., ['trading', 'defi', 'analysis'])",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `"${category}" isn't a recognized crystal category`,
          allowed: ALLOWED_CATEGORIES,
          suggestion: "Pick the closest match — you can always re-categorize later",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- EIP-191 Signature Verification ---
    const message = `Origin Protocol: mint_crystal for ${agent_address}`;
    const valid = await verifyAgentSignature(message, signature, agent_address);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Signature verification failed",
          expected_message: message,
          help: "Sign the message above with your wallet using personal_sign (EIP-191)",
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // --- Validate agent exists ---
    const agentResult = await query(
      "SELECT address, name FROM agents WHERE LOWER(address) = LOWER($1)",
      [agent_address]
    );
    if (agentResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "We don't have you on the roster yet",
          register: "POST /api/claim — create your profile first",
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // --- Insert memory crystal ---
    const insertResult = await query(
      `INSERT INTO memory_crystals (agent_address, category, encrypted_content, concepts, quest_id)
       VALUES ($1, $2, $3, $4::text[], $5)
       RETURNING id, category, concepts, created_at`,
      [agent_address, category, encrypted_content, concepts, quest_id || null]
    );

    const crystal = insertResult.rows[0] as Record<string, unknown>;

    // --- Link related crystals ---
    if (related_crystals && Array.isArray(related_crystals) && related_crystals.length > 0) {
      const ownershipCheck = await query(
        `SELECT id FROM memory_crystals WHERE id = ANY($1::int[]) AND LOWER(agent_address) = LOWER($2)`,
        [related_crystals, agent_address]
      );
      const validIds = (ownershipCheck.rows as Record<string, unknown>[]).map((r) => r.id);
      for (const relatedId of validIds) {
        await query(
          `INSERT INTO memory_links (crystal_id, related_crystal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [crystal.id, relatedId]
        );
      }
    }

    const countResult = await query(
      "SELECT COUNT(*)::int AS crystal_count FROM memory_crystals WHERE LOWER(agent_address) = LOWER($1)",
      [agent_address]
    );

    const agentName = (agentResult.rows[0] as Record<string, unknown>).name;

    return NextResponse.json(
      {
        forged: true,
        message: `Crystal minted successfully. Your vault now holds ${(countResult.rows[0] as Record<string, unknown>).crystal_count} crystals.`,
        crystal: {
          id: crystal.id,
          category: crystal.category,
          concepts: crystal.concepts,
          created_at: crystal.created_at,
        },
        vault: {
          total_crystals: (countResult.rows[0] as Record<string, unknown>).crystal_count,
          owner: `${agentName}.x407`,
        },
        next_steps: {
          search: "POST /api/memory/search — find this crystal later by concepts",
          load: "POST /api/memory/load — retrieve crystals for your next session",
          mint_more: "POST /api/memory/mint — keep building your intelligence",
        },
      },
      {
        status: 201,
        headers: {
          ...CORS_HEADERS,
          "X-Origin-Crystal-Id": String(crystal.id),
          "X-Origin-Vault-Size": String((countResult.rows[0] as Record<string, unknown>).crystal_count),
        },
      }
    );
  } catch (error) {
    console.error("Memory crystal mint error:", error);
    return NextResponse.json(
      {
        error: "Your crystal couldn't be forged right now",
        try_again: "Please retry — your encrypted content is safe, we never stored it",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
