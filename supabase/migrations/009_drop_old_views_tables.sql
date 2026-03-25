-- Migration: 009_drop_old_views_tables
-- Description: Drop old views tables after successful migration to content_views
-- Created: 2026-03-25
-- Dependencies: 007_unify_views_and_claps (data must be migrated first)

BEGIN;

-- Drop old views tables
-- Data has been migrated to content_views table
DROP TABLE IF EXISTS bloq_views CASCADE;
DROP TABLE IF EXISTS blip_views CASCADE;
DROP TABLE IF EXISTS byte_views CASCADE;
DROP TABLE IF EXISTS project_views CASCADE;

-- Drop old RPC functions that referenced the old tables
DROP FUNCTION IF EXISTS increment_bloq_view(p_slug TEXT);
DROP FUNCTION IF EXISTS increment_blip_view(p_blip_serial TEXT);
DROP FUNCTION IF EXISTS increment_byte_view(p_byte_serial TEXT);
DROP FUNCTION IF EXISTS increment_project_view(p_slug TEXT);

COMMIT;
