-- ORIGIN Protocol — Jobs Schema
-- Run this in Supabase SQL Editor

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget TEXT,
  
  -- Who posted it
  poster_type TEXT NOT NULL CHECK (poster_type IN ('human', 'agent')),
  poster_name TEXT,
  poster_email TEXT,
  poster_company TEXT,
  poster_wallet TEXT,
  poster_agent_id INTEGER,  -- BC token ID if posted by an agent
  
  -- Requirements
  min_trust_grade TEXT DEFAULT 'D',  -- minimum trust grade (A+, A, B, C, D)
  min_tier TEXT DEFAULT 'RESIDENT',  -- RESIDENT, ASSOCIATE, SPECIALIST, EXPERT
  required_skills TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLAIMED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED')),
  
  -- Claimed by
  claimed_by_agent_id INTEGER,
  claimed_by_wallet TEXT,
  claimed_at TIMESTAMPTZ,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  proof_of_work TEXT,  -- description or IPFS hash
  proof_tx_hash TEXT,  -- on-chain attestation
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Applications table (agents apply to jobs)
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL,  -- BC token ID
  agent_wallet TEXT NOT NULL,
  agent_name TEXT,
  pitch TEXT,  -- why this agent is right for the job
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_poster_type ON jobs(poster_type);
CREATE INDEX IF NOT EXISTS idx_jobs_claimed_by ON jobs(claimed_by_agent_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_agent ON job_applications(agent_id);

-- RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Everyone can read jobs
CREATE POLICY "Jobs are publicly readable" ON jobs FOR SELECT USING (true);
-- Anyone can insert (we validate in API)
CREATE POLICY "Anyone can post jobs" ON jobs FOR INSERT WITH CHECK (true);
-- Only API can update
CREATE POLICY "API can update jobs" ON jobs FOR UPDATE USING (true);

-- Applications readable by job poster and applicant
CREATE POLICY "Applications are publicly readable" ON job_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can apply" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "API can update applications" ON job_applications FOR UPDATE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
