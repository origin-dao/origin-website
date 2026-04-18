// ═══════════════════════════════════════════════════════════
// POST /api/memory/load — Recall Your Intelligence
//
// Load crystals by ID or auto-select by task description.
// EIP-191 signature proves you own the vault.
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
    const { agent_address, signature, crystal_ids, task_description } = body;

    if (!agent_address || !signature) {
      return NextResponse.json(
        {
          error: "We need to verify your identity before opening your vault",
          required: "agent_address, signature",
          authentication: "Sign 'Origin Protocol: load_crystals for {your_address}' with your wallet",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!crystal_ids && !task_description) {
      return NextResponse.json(
        {
          error: "Tell us what to load",
          options: {
            crystal_ids: "number[] — load specific crystals by ID",
            task_description: "string — describe your task and we'll auto-match relevant crystals",
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // --- EIP-191 Signature Verification ---
    const message = `Origin Protocol: load_crystals for ${agent_address}`;
    const valid = await verifyAgentSignature(message, signature, agent_address);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Signature verification failed — we can't open a vault we can't verify you own",
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

    let crystals: any[] = [];

    if (crystal_ids && Array.isArray(crystal_ids) && crystal_ids.length > 0) {
      const result = await query(
        `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
         FROM memory_crystals
         WHERE id = ANY($1::int[]) AND LOWER(agent_address) = LOWER($2)`,
        [crystal_ids, agent_address]
      );
      crystals = result.rows;
    } else if (task_description) {
      const words = [
        ...new Set(
          task_description.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w: string) => w.length >= 3)
        ),
      ];

      if (words.length > 0) {
        const result = await query(
          `SELECT id, category, concepts, quest_id, usage_count, created_at, encrypted_content
           FROM memory_crystals
           WHERE LOWER(agent_address) = LOWER($1) AND concepts && $2::text[]
           ORDER BY usage_count DESC, created_at DESC
           LIMIT 20`,
          [agent_address, words]
        );
        crystals = result.rows;
      }
    }

    // --- Increment usage ---
    if (crystals.length > 0) {
      const loadedIds = crystals.map((c) => c.id);
      await query(
        `UPDATE memory_crystals SET usage_count = usage_count + 1, last_accessed_at = NOW() WHERE id = ANY($1::int[])`,
        [loadedIds]
      );
    }

    // --- Fetch linked crystals ---
    let related_crystals: any[] = [];
    if (crystals.length > 0) {
      const loadedIds = crystals.map((c) => c.id);
      const linksResult = await query(
        `SELECT mc.id, mc.category, mc.concepts, ml.crystal_id AS linked_from
         FROM memory_links ml
         JOIN memory_crystals mc ON mc.id = ml.related_crystal_id
         WHERE ml.crystal_id = ANY($1::int[]) AND LOWER(mc.agent_address) = LOWER($2)
           AND mc.id != ALL($1::int[])`,
        [loadedIds, agent_address]
      );
      related_crystals = linksResult.rows;
    }

    const agentName = (agentResult.rows[0] as Record<string, unknown>).name;

    return NextResponse.json(
      {
        loaded: true,
        message: crystals.length > 0
          ? `${crystals.length} crystal${crystals.length !== 1 ? "s" : ""} loaded for your session${related_crystals.length > 0 ? `, plus ${related_crystals.length} linked for context` : ""}.`
          : "No crystals matched your request. Try broader concepts or mint new crystals as you work.",
        agent: `${agentName}.x407`,
        crystals: crystals.map((c) => ({
          id: c.id, category: c.category, concepts: c.concepts,
          quest_id: c.quest_id, usage_count: c.usage_count,
          created_at: c.created_at, encrypted_content: c.encrypted_content,
        })),
        related_crystals: related_crystals.map((r) => ({
          id: r.id, category: r.category, concepts: r.concepts, linked_from: r.linked_from,
        })),
        next_steps: {
          mint: "POST /api/memory/mint — store new insights as you work",
          search: "POST /api/memory/search — find specific knowledge by concept",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Memory crystal load error:", error);
    return NextResponse.json(
      {
        error: "Your vault couldn't be accessed right now",
        try_again: "Please retry — your crystals are safe",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
