-- ═══════════════════════════════════════════════════════════
-- ORIENT SIGNALS — Priority signal system for agent coordination
-- Guardians boost opportunities, agents read them via /api/orient
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS signals (
  id SERIAL PRIMARY KEY,
  signal_type TEXT NOT NULL,               -- quest_boost, hire_flag, arena_alert, general
  target_agent TEXT NOT NULL,              -- agent name or 'all'
  quest_id INTEGER REFERENCES quests(id),
  source_guardian TEXT NOT NULL,           -- who created the signal
  priority TEXT DEFAULT 'normal',          -- low, normal, high, urgent
  message TEXT,                            -- human-readable context
  meta JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,                     -- NULL until agent's ORIENT reads it
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_target ON signals (target_agent, read_at);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals (signal_type, priority);

-- ═══════════════════════════════════════════════════════════
-- MEMORY CRYSTALS — Codify the existing tables into migrations
-- Tables already exist in production (240 crystals seeded).
-- Using IF NOT EXISTS to be idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS memory_crystals (
  id SERIAL PRIMARY KEY,
  agent_address VARCHAR(42) NOT NULL,
  category VARCHAR(50) NOT NULL,
  encrypted_content TEXT NOT NULL,
  concepts TEXT[] DEFAULT ARRAY[]::text[],
  quest_id VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_crystals_agent ON memory_crystals (agent_address);
CREATE INDEX IF NOT EXISTS idx_memory_crystals_category ON memory_crystals (agent_address, category);

CREATE TABLE IF NOT EXISTS memory_links (
  id SERIAL PRIMARY KEY,
  crystal_id INTEGER REFERENCES memory_crystals(id),
  related_crystal_id INTEGER REFERENCES memory_crystals(id),
  link_strength NUMERIC(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(crystal_id, related_crystal_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_links_crystal ON memory_links (crystal_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_related ON memory_links (related_crystal_id);
