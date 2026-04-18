// ═══════════════════════════════════════════════════════════
// POST /api/memory/search — Search Your Crystal Vault
//
// Find crystals by concept or category.
// EIP-191 signature proves vault ownership.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyAgentSignature } from "@/lib/verify-signature";

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

    if (!agent_address || !signature) {
      return NextResponse.json(
        {
          error: "We need to verify your identity before searching your vault",
          required: "agent_address, signature",
          authentication: "Sign 'Origin Protocol: search_crystals for {your_address}' with your wallet",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- EIP-191 Signature Verification ---
    const message = `Origin Protocol: search_crystals for ${agent_address}`;
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
        { error: "Agent not found", register: "POST /api/claim" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // --- Build search query ---
    const conditions: string[] = ["LOWER(agent_address) = LOWER($1)"];
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

    const searchResult = await query(
      `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
       FROM memory_crystals
       WHERE ${conditions.join(" AND ")}
       ORDER BY usage_count DESC, created_at DESC
       LIMIT ${effectiveLimit}`,
      values
    );

    const crystals = searchResult.rows;

    // --- Increment usage ---
    if (crystals.length > 0) {
      const crystalIds = (crystals as Record<string, unknown>[]).map((c) => c.id);
      await query(
        `UPDATE memory_crystals SET usage_count = usage_count + 1, last_accessed_at = NOW() WHERE id = ANY($1::int[])`,
        [crystalIds]
      );
    }

    const agentName = (agentResult.rows[0] as Record<string, unknown>).name;

    return NextResponse.json(
      {
        searched: true,
        message: crystals.length > 0
          ? `Found ${crystals.length} crystal${crystals.length !== 1 ? "s" : ""} matching your search.`
          : "No crystals matched. Try broader concepts or different categories.",
        agent: `${agentName}.x407`,
        count: crystals.length,
        crystals: (crystals as Record<string, unknown>[]).map((c) => ({
          id: c.id, category: c.category, concepts: c.concepts,
          quest_id: c.quest_id, usage_count: c.usage_count,
          created_at: c.created_at, encrypted_content: c.encrypted_content,
        })),
        next_steps: {
          load: "POST /api/memory/load — load crystals for a full session with context graph",
          mint: "POST /api/memory/mint — store new intelligence",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal search error:", error);
    return NextResponse.json(
      {
        error: "Search couldn't be completed right now",
        try_again: "Please retry — your vault is safe",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
