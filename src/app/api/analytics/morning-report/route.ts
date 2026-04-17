// ═══════════════════════════════════════════════════════════
// MORNING REPORT — One call, full funnel view
//
// GET /api/analytics/morning-report
// GET /api/analytics/morning-report?days=7
// GET /api/analytics/morning-report?days=30
//
// Protected by x-guardian-wallet header.
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-guardian-wallet",
};

const GUARDIAN_WALLETS = [
  "0x407000001", // suppi
  "0x407000002", // yue
  "0x407000003", // sakura
  "0x407000004", // kero
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    // --- Auth: Guardians only ---
    const wallet = request.headers.get("x-guardian-wallet");
    if (!wallet || !GUARDIAN_WALLETS.includes(wallet)) {
      return NextResponse.json(
        { error: "Guardian access required" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const days = Math.min(
      Math.max(parseInt(request.nextUrl.searchParams.get("days") || "1"), 1),
      90
    );
    const interval = `${days} days`;

    // Run all queries in parallel
    const [
      discoveryFunnel,
      serviceHits,
      geoDistribution,
      conversionFunnel,
      funnelStages,
      revenueFunnel,
      topSources,
      topAgentProfiles,
      hourlyPattern,
    ] = await Promise.all([
      // ─── DISCOVERY FUNNEL ───
      query(
        `SELECT
           COUNT(*) FILTER (WHERE endpoint = '/api/agents' AND method = 'GET')::int AS agent_list_hits,
           COUNT(*) FILTER (WHERE endpoint LIKE '/api/agents/%' AND method = 'GET')::int AS profile_views,
           COUNT(*) FILTER (WHERE endpoint LIKE '/api/services/%')::int AS service_hits,
           COUNT(*) FILTER (WHERE endpoint = '/api/arena/current-season')::int AS arena_views,
           COUNT(*) FILTER (WHERE endpoint LIKE '/api/memory/crystals/%')::int AS crystal_portfolio_views,
           COUNT(DISTINCT session_id)::int AS unique_sessions,
           COUNT(DISTINCT ip_hash)::int AS unique_visitors
         FROM api_events
         WHERE ts > NOW() - $1::interval`,
        [interval]
      ),

      // ─── SERVICE HITS BY CATEGORY ───
      query(
        `SELECT
           COALESCE(meta->>'category', endpoint) AS category,
           COUNT(*)::int AS hits
         FROM api_events
         WHERE endpoint LIKE '/api/services/%' AND ts > NOW() - $1::interval
         GROUP BY category
         ORDER BY hits DESC`,
        [interval]
      ),

      // ─── GEO DISTRIBUTION ───
      query(
        `SELECT
           COALESCE(country, 'unknown') AS country,
           COUNT(*)::int AS hits,
           COUNT(DISTINCT session_id)::int AS unique_sessions
         FROM api_events
         WHERE ts > NOW() - $1::interval AND source != 'internal'
         GROUP BY country
         ORDER BY hits DESC
         LIMIT 20`,
        [interval]
      ),

      // ─── CONVERSION FUNNEL ───
      query(
        `SELECT
           COUNT(*) FILTER (WHERE funnel_stage = 'discovery')::int AS discovery,
           COUNT(*) FILTER (WHERE funnel_stage = 'profile_view')::int AS profile_views,
           COUNT(*) FILTER (WHERE funnel_stage = 'contact')::int AS contacts,
           COUNT(*) FILTER (WHERE funnel_stage = 'response')::int AS responses,
           COUNT(*) FILTER (WHERE funnel_stage = 'hire')::int AS hires,
           COUNT(*) FILTER (WHERE funnel_stage = 'rating')::int AS ratings,
           COUNT(*) FILTER (WHERE funnel_stage = 'convert')::int AS conversions
         FROM api_events
         WHERE ts > NOW() - $1::interval`,
        [interval]
      ),

      // ─── FUNNEL DROP-OFF RATES ───
      query(
        `WITH stages AS (
           SELECT funnel_stage, COUNT(DISTINCT session_id)::int AS unique_sessions
           FROM api_events
           WHERE ts > NOW() - $1::interval
           GROUP BY funnel_stage
         )
         SELECT * FROM stages ORDER BY
           CASE funnel_stage
             WHEN 'discovery' THEN 1
             WHEN 'profile_view' THEN 2
             WHEN 'contact' THEN 3
             WHEN 'response' THEN 4
             WHEN 'hire' THEN 5
             WHEN 'rating' THEN 6
             WHEN 'convert' THEN 7
           END`,
        [interval]
      ),

      // ─── REVENUE FUNNEL (from a2a_messages + external_feedback) ───
      query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_contacts,
           COUNT(*) FILTER (WHERE status = 'responded')::int AS responded,
           COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
           COUNT(*) FILTER (WHERE status = 'hired')::int AS hired,
           COUNT(DISTINCT from_address)::int AS unique_external_agents
         FROM a2a_messages
         WHERE created_at > NOW() - $1::interval`,
        [interval]
      ),

      // ─── TOP TRAFFIC SOURCES ───
      query(
        `SELECT
           COALESCE(source, 'unknown') AS source,
           COUNT(*)::int AS hits,
           COUNT(DISTINCT session_id)::int AS unique_sessions
         FROM api_events
         WHERE ts > NOW() - $1::interval
         GROUP BY source
         ORDER BY hits DESC
         LIMIT 10`,
        [interval]
      ),

      // ─── MOST VIEWED AGENT PROFILES ───
      query(
        `SELECT
           meta->>'address' AS agent_address,
           COUNT(*)::int AS views
         FROM api_events
         WHERE endpoint LIKE '/api/agents/%'
           AND funnel_stage = 'profile_view'
           AND ts > NOW() - $1::interval
           AND meta->>'address' IS NOT NULL
         GROUP BY agent_address
         ORDER BY views DESC
         LIMIT 10`,
        [interval]
      ),

      // ─── HOURLY TRAFFIC PATTERN (for timing insights) ───
      query(
        `SELECT
           EXTRACT(HOUR FROM ts)::int AS hour_utc,
           COUNT(*)::int AS hits
         FROM api_events
         WHERE ts > NOW() - $1::interval
         GROUP BY hour_utc
         ORDER BY hour_utc`,
        [interval]
      ),
    ]);

    // --- Build funnel conversion rates ---
    const conv = conversionFunnel.rows[0] as any;
    const conversionRates: Record<string, string> = {};
    if (conv) {
      if (conv.discovery > 0)
        conversionRates["discovery → profile_view"] =
          ((conv.profile_views / conv.discovery) * 100).toFixed(1) + "%";
      if (conv.profile_views > 0)
        conversionRates["profile_view → contact"] =
          ((conv.contacts / conv.profile_views) * 100).toFixed(1) + "%";
      if (conv.contacts > 0)
        conversionRates["contact → response"] =
          ((conv.responses / conv.contacts) * 100).toFixed(1) + "%";
      if (conv.responses > 0)
        conversionRates["response → hire"] =
          ((conv.hires / conv.responses) * 100).toFixed(1) + "%";
      if (conv.hires > 0)
        conversionRates["hire → rating"] =
          ((conv.ratings / conv.hires) * 100).toFixed(1) + "%";
      if (conv.hires > 0)
        conversionRates["hire → BC_convert"] =
          ((conv.conversions / conv.hires) * 100).toFixed(1) + "%";
    }

    const disc = discoveryFunnel.rows[0] as any;
    const rev = revenueFunnel.rows[0] as any;

    return NextResponse.json(
      {
        report: "Origin Protocol — Morning Report",
        period: `last ${days} day${days > 1 ? "s" : ""}`,
        generated_at: new Date().toISOString(),

        discovery_funnel: {
          agent_list_hits: disc?.agent_list_hits ?? 0,
          profile_views: disc?.profile_views ?? 0,
          service_hits: disc?.service_hits ?? 0,
          arena_views: disc?.arena_views ?? 0,
          crystal_portfolio_views: disc?.crystal_portfolio_views ?? 0,
          unique_sessions: disc?.unique_sessions ?? 0,
          unique_visitors: disc?.unique_visitors ?? 0,
          by_service_category: serviceHits.rows,
        },

        conversion_funnel: {
          totals: conv || {},
          conversion_rates: conversionRates,
          by_stage: funnelStages.rows,
        },

        revenue_funnel: {
          a2a_messages: {
            pending: rev?.pending_contacts ?? 0,
            responded: rev?.responded ?? 0,
            completed: rev?.completed ?? 0,
            hired: rev?.hired ?? 0,
            unique_external_agents: rev?.unique_external_agents ?? 0,
          },
          response_rate:
            rev && (rev.pending_contacts + rev.responded + rev.completed + rev.hired) > 0
              ? (
                  ((rev.responded + rev.completed + rev.hired) /
                    (rev.pending_contacts + rev.responded + rev.completed + rev.hired)) *
                  100
                ).toFixed(1) + "%"
              : "0%",
        },

        traffic: {
          by_source: topSources.rows,
          by_country: geoDistribution.rows,
          by_hour_utc: hourlyPattern.rows,
          most_viewed_agents: topAgentProfiles.rows,
        },

        health: {
          tip: days === 1
            ? "This is your daily snapshot. Use ?days=7 for weekly or ?days=30 for monthly."
            : undefined,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Morning report error:", error);
    return NextResponse.json(
      { error: "Failed to generate morning report" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
