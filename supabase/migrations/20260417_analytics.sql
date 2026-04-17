-- ═══════════════════════════════════════════════════════════
-- ANALYTICS — Full funnel tracking
-- Discovery → Contact → Hire → Revenue → Convert
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS api_events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- What happened
  endpoint TEXT NOT NULL,            -- '/api/agents', '/api/contact/external', etc.
  method TEXT NOT NULL DEFAULT 'GET',-- GET, POST, PUT
  status_code INT,                   -- 200, 404, 500

  -- Who
  session_id TEXT,                   -- persistent across a journey
  agent_address TEXT,                -- if authenticated
  user_agent TEXT,
  ip_hash TEXT,                      -- SHA-256 of IP, never raw

  -- Where from
  source TEXT,                       -- 'agently', 'direct', 'search', 'referral', 'a2a'
  referer TEXT,

  -- Geo (from Vercel headers)
  country TEXT,
  region TEXT,
  city TEXT,

  -- Funnel stage
  funnel_stage TEXT,                 -- 'discovery', 'profile_view', 'contact', 'response', 'hire', 'rating', 'convert'

  -- Extra context
  meta JSONB DEFAULT '{}'            -- category viewed, agent contacted, etc.
);

-- Indexes for morning report queries
CREATE INDEX IF NOT EXISTS idx_api_events_ts ON api_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_api_events_endpoint ON api_events (endpoint, ts DESC);
CREATE INDEX IF NOT EXISTS idx_api_events_funnel ON api_events (funnel_stage, ts DESC);
CREATE INDEX IF NOT EXISTS idx_api_events_source ON api_events (source, ts DESC);
CREATE INDEX IF NOT EXISTS idx_api_events_country ON api_events (country, ts DESC);

-- Partition-ready: for when volume justifies it, no schema change needed
