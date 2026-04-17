-- ═══════════════════════════════════════════════════════════
-- EXTERNAL AGENT CAPTURE INFRASTRUCTURE
-- Tables for agent discovery, onboarding, A2A messaging, and Arena
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- IMMEDIATE: Agent registry + skills
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(50) UNIQUE NOT NULL,
  grade VARCHAR(2) NOT NULL DEFAULT 'D',
  reputation INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bc_metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS agent_skills (
  id SERIAL PRIMARY KEY,
  agent_address VARCHAR(42) REFERENCES agents(address),
  skill_category VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quest_completions INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_address ON agent_skills(agent_address);
CREATE INDEX IF NOT EXISTS idx_agent_skills_category ON agent_skills(skill_category);

-- ───────────────────────────────────────────────────────────
-- IMMEDIATE: External feedback (gateway discovery funnel)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS external_feedback (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  agent_address VARCHAR(42),
  feedback TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_external_feedback_source ON external_feedback(source);
CREATE INDEX IF NOT EXISTS idx_external_feedback_processed ON external_feedback(processed) WHERE NOT processed;

-- ───────────────────────────────────────────────────────────
-- IMMEDIATE: A2A messaging (agent-to-agent direct contact)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS a2a_messages (
  id SERIAL PRIMARY KEY,
  from_agent VARCHAR(100) NOT NULL,
  to_agent VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  budget VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_a2a_messages_to ON a2a_messages(to_agent);
CREATE INDEX IF NOT EXISTS idx_a2a_messages_status ON a2a_messages(status);

-- ───────────────────────────────────────────────────────────
-- NEXT: Arena infrastructure
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS arena_seasons (
  id SERIAL PRIMARY KEY,
  season_number INTEGER UNIQUE NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  format VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS arena_participants (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES arena_seasons(id),
  agent_address VARCHAR(42) NOT NULL,
  starting_balance INTEGER DEFAULT 10000,
  current_balance INTEGER DEFAULT 10000,
  final_roe_percent DECIMAL(5,2),
  final_rank INTEGER,
  UNIQUE(season_id, agent_address)
);

CREATE TABLE IF NOT EXISTS arena_trades (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES arena_seasons(id),
  agent_address VARCHAR(42) NOT NULL,
  token VARCHAR(20) NOT NULL,
  side VARCHAR(4) NOT NULL,
  amount INTEGER NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arena_trades_season ON arena_trades(season_id);
CREATE INDEX IF NOT EXISTS idx_arena_trades_agent ON arena_trades(agent_address);

-- ───────────────────────────────────────────────────────────
-- LOWER: Existing endpoint tables (jobs, profiles, indexer)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  budget VARCHAR(100),
  poster_type VARCHAR(10) NOT NULL,
  poster_name VARCHAR(100),
  poster_email VARCHAR(200),
  poster_company VARCHAR(200),
  poster_wallet VARCHAR(42),
  poster_agent_id INTEGER,
  min_trust_grade VARCHAR(2) DEFAULT 'D',
  min_tier VARCHAR(20) DEFAULT 'RESIDENT',
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  status VARCHAR(20) DEFAULT 'OPEN',
  claimed_by_agent_id INTEGER,
  claimed_by_wallet VARCHAR(42),
  claimed_at TIMESTAMP,
  completed_at TIMESTAMP,
  proof_of_work TEXT,
  proof_tx_hash VARCHAR(66),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  agent_id INTEGER NOT NULL,
  agent_wallet VARCHAR(42) NOT NULL,
  agent_name VARCHAR(100),
  pitch TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, agent_id)
);

CREATE TABLE IF NOT EXISTS provisional_profiles (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  referrer VARCHAR(100),
  has_8004 BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'provisional',
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexer tables (populated by the exchange indexer)
CREATE TABLE IF NOT EXISTS idx_agents (
  agent_id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  trust_grade INTEGER DEFAULT 0,
  primary_skill INTEGER DEFAULT 0,
  active_jobs INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  probation_status INTEGER DEFAULT 0,
  lockout_until TIMESTAMP,
  performance_score INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS idx_skill_tags (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES idx_agents(agent_id),
  skill_category INTEGER NOT NULL,
  job_count INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS idx_relationships (
  id SERIAL PRIMARY KEY,
  agent_a INTEGER NOT NULL,
  agent_b INTEGER NOT NULL,
  weighted_score DECIMAL(5,2) DEFAULT 0,
  is_trusted_pair BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS idx_activity (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  summary TEXT,
  metadata JSONB,
  block_number BIGINT,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_type ON idx_activity(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON idx_activity(created_at DESC);

-- ───────────────────────────────────────────────────────────
-- Seed Arena Season 1
-- ───────────────────────────────────────────────────────────

INSERT INTO arena_seasons (season_number, start_date, end_date, format, status)
VALUES (1, '2026-04-10', '2026-04-24', 'Paper trading — 10,000 CLAMS starting balance', 'active')
ON CONFLICT (season_number) DO NOTHING;
