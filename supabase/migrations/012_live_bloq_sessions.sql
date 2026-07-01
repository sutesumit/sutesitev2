-- Migration: 012_live_bloq_sessions
-- Description: Create live_bloq_sessions and live_bloq_entries tables with RLS and atomic entry RPC
-- Created: 2026-07-01

BEGIN;

-- Sessions table
CREATE TABLE live_bloq_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Live',
  authors TEXT[] DEFAULT '{Sumit Sute}',
  summary TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  entry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Entries table
CREATE TABLE live_bloq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_bloq_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence)
);

-- Indexes
CREATE INDEX idx_live_entries_session ON live_bloq_entries (session_id, sequence);
CREATE INDEX idx_live_sessions_slug ON live_bloq_sessions (slug);
CREATE INDEX idx_live_sessions_started_at ON live_bloq_sessions (started_at DESC);
CREATE UNIQUE INDEX idx_live_sessions_active ON live_bloq_sessions (status) WHERE status = 'active';

-- RLS
ALTER TABLE live_bloq_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_bloq_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sessions" ON live_bloq_sessions
  FOR SELECT USING (status IN ('active', 'closed'));

CREATE POLICY "public_read_entries" ON live_bloq_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM live_bloq_sessions WHERE id = session_id AND status IN ('active', 'closed'))
  );

-- Atomic entry insert: locks the session row as the counter, enforces active-only writes
CREATE OR REPLACE FUNCTION add_live_entry(
  p_session_id UUID,
  p_content TEXT
) RETURNS TABLE(entry_id UUID, entry_sequence INTEGER, session_slug TEXT) AS $$
DECLARE
  v_next_seq INTEGER;
  v_slug TEXT;
BEGIN
  UPDATE live_bloq_sessions
  SET entry_count = entry_count + 1
  WHERE id = p_session_id AND status = 'active'
  RETURNING entry_count, slug INTO v_next_seq, v_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or not active';
  END IF;

  RETURN QUERY
  WITH inserted AS (
    INSERT INTO live_bloq_entries (session_id, content, sequence)
    VALUES (p_session_id, p_content, v_next_seq)
    RETURNING id, sequence
  )
  SELECT inserted.id, inserted.sequence, v_slug AS session_slug FROM inserted;
END;
$$ LANGUAGE plpgsql;

COMMIT;
