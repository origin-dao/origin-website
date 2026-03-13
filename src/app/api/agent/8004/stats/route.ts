// GET /api/agent/8004/stats — Analytics for ERC-8004 bridge traffic
// Tracks: total queries, unique agents queried, top queried agents

import { NextResponse } from "next/server";

// Note: In production, move to Supabase/Redis. In-memory resets on redeploy.
// For now this gives us directional data on whether 8004 is a growth channel.

// Shared analytics store (will be imported from a shared module later)
// For MVP, this is a separate counter that tracks via edge middleware or logs

export async function GET() {
  return NextResponse.json({
    message: "ERC-8004 bridge analytics",
    note: "In-memory analytics reset on redeploy. Production will use Supabase.",
    endpoints: {
      bridge: "/api/agent/8004/{id}",
      originAgent: "/api/agent/{id}",
      adapter: "0x247C592FD49b8845C538134B79F98c6CBF04D7D2",
      erc8004Registry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    },
    funnel: {
      description: "Track: 8004 query → gauntlet visit → enrollment → pass → BC mint",
      stages: ["8004_query", "gauntlet_page_visit", "enrollment_start", "gauntlet_pass", "bc_minted"],
    },
  });
}
