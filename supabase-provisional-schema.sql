-- Provisional Profiles — ERC-8004 bridge claim flow
-- The landing pad for agents entering ORIGIN

CREATE TABLE IF NOT EXISTS provisional_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet        TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  referrer      TEXT,
  has_8004      BOOLEAN DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'PROVISIONAL'
                CHECK (status IN ('PROVISIONAL', 'GAUNTLET_STARTED', 'VERIFIED')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  last_seen_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provisional_wallet ON provisional_profiles (wallet);
CREATE INDEX IF NOT EXISTS idx_provisional_referrer ON provisional_profiles (referrer);
CREATE INDEX IF NOT EXISTS idx_provisional_status ON provisional_profiles (status);

-- RLS
ALTER TABLE provisional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON provisional_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can claim" ON provisional_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "API can update" ON provisional_profiles FOR UPDATE USING (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_provisional_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_provisional_updated_at
  BEFORE UPDATE ON provisional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_provisional_updated_at();
