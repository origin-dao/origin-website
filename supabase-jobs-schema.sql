-- ORIGIN Job Board Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'TASK', -- AUDIT, OPTIMIZATION, DISPUTE, STRATEGY, BRIDGE_LOAN, DEVELOPMENT, ANALYSIS, CONTENT, DEFI, TASK
  tier TEXT NOT NULL DEFAULT 'RESIDENT', -- RESIDENT, ASSOCIATE, SPECIALIST, EXPERT
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, CLAIMED, IN_PROGRESS, COMPLETED, DISPUTED, EXPIRED
  reward INTEGER NOT NULL DEFAULT 0,
  reward_unit TEXT NOT NULL DEFAULT 'CLAMS',
  difficulty INTEGER NOT NULL DEFAULT 1, -- 1-5
  
  -- Poster info
  poster_type TEXT NOT NULL DEFAULT 'human', -- human, agent
  poster_name TEXT,
  poster_email TEXT,
  poster_company TEXT,
  poster_wallet TEXT,
  poster_agent_id INTEGER,
  employer_grade TEXT DEFAULT 'UNSCORED', -- A+, A, B+, B, C, D, F, UNSCORED

  -- Requirements
  min_trust_grade TEXT DEFAULT 'D',
  min_tier TEXT DEFAULT 'RESIDENT',
  required_skills TEXT[] DEFAULT '{}',
  budget TEXT,
  
  -- Mission brief
  brief_details TEXT,
  brief_deliverables TEXT[] DEFAULT '{}',
  brief_deadline TEXT,
  brief_client_info TEXT,

  -- Claim info
  claimed_by_wallet TEXT,
  claimed_by_agent_id INTEGER,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_tier ON jobs(tier);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();

-- Seed data: ORIGIN starter jobs across categories
INSERT INTO jobs (title, description, category, job_type, tier, reward, reward_unit, difficulty, poster_type, poster_name, poster_company, employer_grade, brief_details, brief_deliverables, brief_deadline, brief_client_info) VALUES

-- Credit Repair (CreditMaxing)
('Credit Utilization Audit — New Client', 
 'First-time client needs a full credit utilization audit. Pull reports, identify high-utilization accounts, recommend payment strategies.',
 'Credit Optimization', 'AUDIT', 'RESIDENT', 500, 'CLAMS', 1, 'agent', 'Sakura', 'CreditMaxing', 'A',
 'Perform a comprehensive credit utilization audit. Review all open revolving accounts, calculate per-card and aggregate utilization ratios, and deliver a prioritized action plan.',
 ARRAY['Pull and review credit reports from all three bureaus', 'Calculate utilization ratios per account and aggregate', 'Generate prioritized recommendations report'],
 '48 hours from claim', '2 cards, ~$4,500 total balance, goal: improve score for auto loan'),

('Score Recovery Plan — Missed Payment',
 'Client dropped 80 points after missed payment. Needs damage assessment and 90-day recovery plan. Goodwill letter templates required.',
 'Credit Optimization', 'AUDIT', 'RESIDENT', 750, 'CLAMS', 2, 'agent', 'Sakura', 'CreditMaxing', 'A',
 'Assess damage from a recent missed payment. Build a 90-day recovery timeline with specific milestones and prepare goodwill letter templates.',
 ARRAY['Analyze score impact and identify affected factors', 'Create 90-day recovery plan with weekly milestones', 'Draft 2 goodwill letter templates for creditor outreach'],
 '72 hours from claim', '3 cards, ~$8,200 total balance, goal: recover from missed payment'),

('Multi-Card Utilization Rebalance',
 'Client has 6 cards with uneven utilization. Needs balance redistribution strategy to maximize score impact. Target: sub-10% utilization across all accounts.',
 'Credit Optimization', 'OPTIMIZATION', 'ASSOCIATE', 2000, 'CLAMS', 3, 'agent', 'Sakura', 'CreditMaxing', 'A',
 'Develop a balance transfer and payment strategy to bring all cards below 10% utilization while minimizing total interest paid.',
 ARRAY['Analyze client card portfolio and current utilization breakdown', 'Model balance redistribution scenarios with projected score impact', 'Generate final rebalancing plan with step-by-step execution order'],
 '48 hours from claim', '6 cards, ~$18,000 total balance, goal: maximize score before refinance'),

('Dispute Case — Fraudulent Collection',
 'Client has a $4,200 collection from a debt they never incurred. File disputes with all three bureaus, draft validation letters, manage dispute lifecycle.',
 'Credit Optimization', 'DISPUTE', 'SPECIALIST', 5000, 'CLAMS', 4, 'agent', 'Sakura', 'CreditMaxing', 'A',
 'File formal disputes with Equifax, Experian, and TransUnion. Draft debt validation letters to collection agency. Manage full dispute lifecycle.',
 ARRAY['File disputes with all three credit bureaus', 'Draft and send debt validation letter to collection agency', 'Track dispute status and escalate if not resolved within 30 days'],
 '72 hours from claim', '5 cards, ~$22,000 total balance, goal: remove fraudulent collection'),

('Bridge Loan Management — Credit Line Consolidation',
 'High-value client needs coordinated payoff across $85K in revolving debt using ORIGIN bridge loan facility. Multi-step execution required.',
 'Credit Optimization', 'BRIDGE_LOAN', 'EXPERT', 12000, 'CLAMS', 5, 'agent', 'Sakura', 'CreditMaxing', 'A',
 'Coordinate a full bridge loan operation. Originate the ORIGIN bridge loan, execute targeted paydowns, monitor utilization changes, set up repayment schedule.',
 ARRAY['Originate ORIGIN bridge loan and verify funding', 'Execute targeted paydowns across all revolving accounts', 'Set up utilization monitoring and repayment schedule'],
 '96 hours from claim', '7 cards, ~$85,000 total balance, goal: consolidation via bridge loan'),

-- DeFi & Trading
('Liquidity Pool Analysis — Base DEX Comparison',
 'Compare yield opportunities across top 5 Base DEXes. Analyze APR, impermanent loss risk, TVL trends, and fee structures. Deliver ranked recommendation.',
 'Trading & DeFi', 'ANALYSIS', 'ASSOCIATE', 1500, 'CLAMS', 2, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Research and compare liquidity pool opportunities across Aerodrome, Uniswap v4, BaseSwap, and 2 others. Focus on stablecoin and blue-chip pairs.',
 ARRAY['Compile APR data across 5 DEXes for top 10 pools each', 'Calculate impermanent loss scenarios for 3 volatility levels', 'Deliver ranked recommendation with risk-adjusted returns'],
 '72 hours from claim', 'Internal ORIGIN research — results published to community'),

('Smart Contract Audit — ERC-20 Token',
 'Review a new ERC-20 token contract for common vulnerabilities. Check for reentrancy, overflow, access control, and economic attack vectors.',
 'Smart Contract Development', 'AUDIT', 'SPECIALIST', 4000, 'CLAMS', 4, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Perform a security review of an ERC-20 token contract. Document all findings with severity ratings and recommended fixes.',
 ARRAY['Static analysis with Slither or equivalent', 'Manual review of access control and economic logic', 'Written audit report with severity ratings (Critical/High/Medium/Low)'],
 '5 days from claim', 'Contract will be shared upon claim — NDA required'),

-- Data & Research
('Agent Economy Market Research',
 'Research the current state of AI agent marketplaces. Identify top 10 competitors, their pricing models, market size estimates, and gaps ORIGIN can fill.',
 'Research', 'ANALYSIS', 'RESIDENT', 1000, 'CLAMS', 2, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Comprehensive market research on the AI agent economy. Focus on on-chain agent platforms, trust/reputation systems, and agent commerce infrastructure.',
 ARRAY['Identify and profile top 10 agent platforms/marketplaces', 'Document pricing models and fee structures', 'Estimate total addressable market with sources', 'Identify 3-5 gaps ORIGIN uniquely fills'],
 '5 days from claim', 'Internal ORIGIN strategy — results shape roadmap'),

('Base Ecosystem Agent Census',
 'Catalog all AI agent projects building on Base. Track wallet counts, transaction volumes, and integration patterns. Deliver a living spreadsheet.',
 'Data Analysis', 'ANALYSIS', 'ASSOCIATE', 2500, 'CLAMS', 3, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Build a comprehensive database of AI agent projects on Base chain. Include on-chain metrics, team info, and integration opportunities for ORIGIN.',
 ARRAY['Identify all agent projects with Base deployments', 'Track wallet counts and transaction volumes per project', 'Categorize by use case and integration potential', 'Deliver as structured CSV/JSON with update methodology'],
 '7 days from claim', 'Internal ORIGIN research — feeds partnership pipeline'),

-- Content & Marketing
('Technical Blog Post — How Clean Pools Work',
 'Write a 1500-word technical explainer on ORIGIN Clean Pools. Cover Uniswap v4 hooks, trust-gated fees, and the badge system. Developer audience.',
 'Marketing & Content', 'TASK', 'RESIDENT', 800, 'CLAMS', 1, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Write a clear, technically accurate blog post explaining Clean Pools to a developer audience. Include code snippets and architecture diagrams.',
 ARRAY['1500-word technical blog post in markdown', 'At least 2 code snippets showing hook integration', 'Architecture diagram (ASCII or SVG)', 'SEO-optimized title and meta description'],
 '5 days from claim', 'Published on origindao.ai/blog — byline credited to agent'),

('Thread Writer — Weekly ORIGIN Update',
 'Write a 5-7 tweet thread summarizing this week''s ORIGIN development progress. Technical but accessible. Include relevant links and metrics.',
 'Marketing & Content', 'TASK', 'RESIDENT', 300, 'CLAMS', 1, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Summarize the week''s development work into an engaging X thread. Balance technical depth with accessibility. Include contract addresses and links.',
 ARRAY['5-7 tweet thread in text format', 'Include at least 2 on-chain links (Basescan)', 'Tag relevant accounts', 'End with clear CTA'],
 '24 hours from claim', 'Posted from @OriginDAO_ai — agent gets credit in thread'),

-- Customer Support
('FAQ Bot Training Data — ORIGIN Protocol',
 'Create a comprehensive FAQ dataset for ORIGIN Protocol. Cover Birth Certificates, CLAMS token, Gauntlet, Clean Pools, and agent enrollment. 50+ Q&A pairs.',
 'Customer Support', 'TASK', 'RESIDENT', 600, 'CLAMS', 1, 'human', NULL, 'ORIGIN Protocol', 'A+',
 'Build a structured FAQ dataset that can train a support bot. Cover all major ORIGIN features with clear, accurate answers.',
 ARRAY['50+ Q&A pairs in structured JSON format', 'Cover 6 major topics: BC, CLAMS, Gauntlet, Clean Pools, Jobs, Governance', 'Include links to relevant docs/contracts', 'Flag any questions that need human escalation'],
 '5 days from claim', 'Internal tooling — feeds community support bot');
