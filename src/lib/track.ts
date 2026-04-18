// ═══════════════════════════════════════════════════════════
// TRACK — Fire-and-forget analytics for every API route
//
// Usage in any route handler:
//   track(request, "/api/agents", "discovery", { category: "trading" });
//
// Never blocks. Never throws. Never breaks your route.
// ═══════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { query } from "./db";
import { createHash } from "crypto";

type FunnelStage =
  | "discovery"
  | "profile_view"
  | "contact"
  | "response"
  | "hire"
  | "rating"
  | "convert"
  | "quest_created"
  | "quest_submission"
  | "quest_evaluated";

export function track(
  request: NextRequest,
  endpoint: string,
  funnelStage: FunnelStage,
  meta?: Record<string, unknown>,
  statusCode?: number
): void {
  // Fire and forget — don't await, don't block
  _track(request, endpoint, funnelStage, meta, statusCode).catch(() => {});
}

async function _track(
  request: NextRequest,
  endpoint: string,
  funnelStage: FunnelStage,
  meta?: Record<string, unknown>,
  statusCode?: number
): Promise<void> {
  const ua = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const agentAddress =
    request.headers.get("x-agent-address") || null;

  // Vercel geo headers
  const country = request.headers.get("x-vercel-ip-country") || null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;

  // Hash IP — never store raw
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ipHash = createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

  // Detect source
  const source = detectSource(ua, referer, request.nextUrl.searchParams);

  // Session — from header or cookie, falls back to ip+ua hash
  const sessionId =
    request.headers.get("x-session-id") ||
    request.cookies.get("origin_session")?.value ||
    createHash("sha256")
      .update(rawIp + ua)
      .digest("hex")
      .slice(0, 12);

  await query(
    `INSERT INTO api_events
       (endpoint, method, status_code, session_id, agent_address, user_agent,
        ip_hash, source, referer, country, region, city, funnel_stage, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      endpoint,
      request.method,
      statusCode || 200,
      sessionId,
      agentAddress,
      ua.slice(0, 500),
      ipHash,
      source,
      referer.slice(0, 500),
      country,
      region,
      city,
      funnelStage,
      JSON.stringify(meta || {}),
    ]
  );
}

function detectSource(
  ua: string,
  referer: string,
  params: URLSearchParams
): string {
  // Explicit utm/source param
  const utm = params.get("utm_source") || params.get("source");
  if (utm) return utm.toLowerCase();

  // Known agent platforms
  const r = referer.toLowerCase();
  if (r.includes("agently")) return "agently";
  if (r.includes("google") || r.includes("bing") || r.includes("duckduckgo"))
    return "search";
  if (r.includes("twitter") || r.includes("x.com")) return "twitter";
  if (r.includes("github")) return "github";
  if (r.includes("origindao.ai")) return "internal";

  // A2A agents
  const agent = ua.toLowerCase();
  if (agent.includes("agent") || agent.includes("bot") || agent.includes("ai"))
    return "a2a";

  // Has referer but unknown
  if (referer) return "referral";

  return "direct";
}
