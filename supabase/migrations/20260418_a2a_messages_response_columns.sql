-- ═══════════════════════════════════════════════════════════
-- Add response columns to a2a_messages
--
-- The respond endpoint writes to these columns but the
-- original migration didn't include them.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE a2a_messages
  ADD COLUMN IF NOT EXISTS response TEXT,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
