-- Migration: 010_content_views_rls
-- Description: Enable RLS on content_views table with appropriate policies
-- Created: 2026-03-25

BEGIN;

-- Enable RLS on content_views
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read view counts (public data)
CREATE POLICY "Anyone can read view counts" ON content_views
    FOR SELECT USING (true);

-- Policy: Only service role can insert (via RPC functions)
-- The RPC functions use SECURITY DEFINER, so they bypass RLS
-- This policy prevents direct anonymous inserts
CREATE POLICY "Only authenticated can insert" ON content_views
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only service role can update (via RPC functions)
CREATE POLICY "Only authenticated can update" ON content_views
    FOR UPDATE USING (auth.role() = 'authenticated');

COMMIT;
