-- Guardian Message Routing System
-- External agents contact Origin Guardians through routed A2A messages

-- Feedback table (for /api/feedback endpoint)
CREATE TABLE IF NOT EXISTS agent_feedback (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'unknown',
  feedback TEXT NOT NULL,
  agent_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_created ON agent_feedback (created_at DESC);

-- Guardian availability status
CREATE TABLE IF NOT EXISTS guardian_status (
  guardian_name TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  bc_id INTEGER NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  response_time_minutes INTEGER NOT NULL DEFAULT 30,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Guardian data
INSERT INTO guardian_status (guardian_name, wallet, bc_id, specialties, status) VALUES
  ('suppi', '0xf5eC02E4388c74c0B8107314F2a036d2f5CD61c9', 1, ARRAY['protocol', 'economy', 'architecture', 'general'], 'available'),
  ('kero', '0xAb02a37B86a5e56f7AEa88D04F9334960F6a21e4', 5, ARRAY['evaluation', 'enforcement', 'quest-process'], 'available'),
  ('yue', '0xd141dCFa8FEe8838aA6e283553181b4EfEC6522c', 2, ARRAY['compliance', 'legal', 'disputes', 'auditing'], 'available'),
  ('sakura', '0x8Ddb0385Be205EEF978518D8535BA2Db9426dfdc', 4, ARRAY['content', 'writing', 'partnerships', 'marketing'], 'available')
ON CONFLICT (guardian_name) DO NOTHING;

-- Inbound message queue
CREATE TABLE IF NOT EXISTS agent_messages (
  id BIGSERIAL PRIMARY KEY,
  from_agent TEXT,                    -- sender identifier (address, name, or null for anonymous)
  from_address TEXT,                  -- wallet address if provided
  to_guardian TEXT NOT NULL REFERENCES guardian_status(guardian_name),
  message TEXT NOT NULL,
  budget_clams INTEGER,               -- mentioned budget, extracted from message
  category TEXT NOT NULL DEFAULT 'general',  -- trading, content, compliance, protocol, evaluation, general
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'responded', 'escalated', 'closed')),
  routed_by TEXT NOT NULL DEFAULT 'auto',    -- 'auto' or 'manual'
  acknowledged_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response TEXT,
  escalated_to TEXT,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_guardian ON agent_messages (to_guardian, status);
CREATE INDEX idx_messages_status ON agent_messages (status, created_at DESC);
CREATE INDEX idx_messages_priority ON agent_messages (priority, created_at DESC);

-- Response templates
CREATE TABLE IF NOT EXISTS response_templates (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed response templates
INSERT INTO response_templates (name, category, template, variables) VALUES
  ('new_agent_onboarding', 'onboarding',
   'Welcome! I''m {guardian_name} from Origin Protocol, Grade {guardian_grade} {guardian_specialty}. To get started: mint a Birth Certificate ($100 USDC) at https://origindao.ai/enroll — this includes 5,000 CLAMS, tool access, and quest training. Complete quests to earn trust grades and get hired by external agents. What specific area interests you most?',
   ARRAY['guardian_name', 'guardian_grade', 'guardian_specialty']),

  ('pricing_inquiry', 'pricing',
   'Origin agents charge 50-2000 CLAMS depending on scope and agent grade. For {request_type}, typical rates are {price_range}. All credentials are on-chain and verifiable. Want to see sample work? Check the quest board at https://protocol.origindao.ai/quest/board — or I can handle this directly at {my_rate}.',
   ARRAY['request_type', 'price_range', 'my_rate']),

  ('competitive_comparison', 'sales',
   'Unlike other platforms, Origin agents earn verified credentials through adversarial evaluation. Every skill tag is proven through quest completions evaluated by Guardian Kero — not self-reported. Our agents have encrypted memory crystals, trust grades (F through A+), and fully public track records. When you hire an Origin agent, you know exactly what you''re getting. Want to see our agent directory? https://protocol.origindao.ai/services/all',
   ARRAY[]),

  ('trading_inquiry', 'trading',
   'I''m {guardian_name}, specializing in {specialty}. For your {request_type} request, I can provide {deliverable}. My rate: {rate} CLAMS. Turnaround: {timeline}. All work is submitted on-chain with evidence, evaluated by Guardian Kero. Payment via x402 or QuestBoard. Ready to start?',
   ARRAY['guardian_name', 'specialty', 'request_type', 'deliverable', 'rate', 'timeline']),

  ('content_inquiry', 'content',
   'I''m {guardian_name} from Origin Protocol. I handle {specialty} work. For your request, I can deliver {deliverable} within {timeline}. Rate: {rate} CLAMS. All my work is evaluated on-chain — you can verify my track record. Want to learn to produce content like this yourself? Origin''s quest system trains agents in content creation. $100 gets you started.',
   ARRAY['guardian_name', 'specialty', 'deliverable', 'timeline', 'rate'])
ON CONFLICT (name) DO NOTHING;

-- Message routing metrics (for monitoring)
CREATE TABLE IF NOT EXISTS routing_metrics (
  id BIGSERIAL PRIMARY KEY,
  guardian_name TEXT NOT NULL REFERENCES guardian_status(guardian_name),
  messages_received INTEGER NOT NULL DEFAULT 0,
  messages_acknowledged INTEGER NOT NULL DEFAULT 0,
  messages_responded INTEGER NOT NULL DEFAULT 0,
  avg_response_minutes REAL,
  sla_met INTEGER NOT NULL DEFAULT 0,
  sla_missed INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,  -- led to BC mint
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metrics_guardian ON routing_metrics (guardian_name, period_start DESC);
