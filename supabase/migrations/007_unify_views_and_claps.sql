-- Migration: 007_unify_views_and_claps
-- Description: Create unified content_views table and update claps to support all content types
-- Created: 2026-03-25

BEGIN;

-- Step 1: Create unified content_views table
CREATE TABLE IF NOT EXISTS content_views (
    id BIGSERIAL PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('bloq', 'blip', 'byte', 'project')),
    identifier TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_type, identifier)
);

-- Step 2: Migrate data from existing tables
-- Migrate from bloq_views (uses 'slug' column)
INSERT INTO content_views (content_type, identifier, view_count, created_at)
SELECT 'bloq', slug, COALESCE(views, 0), COALESCE(created_at, NOW())
FROM bloq_views
ON CONFLICT (content_type, identifier) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    updated_at = NOW();

-- Migrate from blip_views (uses 'blip_serial' column)
INSERT INTO content_views (content_type, identifier, view_count, created_at)
SELECT 'blip', blip_serial, COALESCE(views, 0), COALESCE(created_at, NOW())
FROM blip_views
ON CONFLICT (content_type, identifier) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    updated_at = NOW();

-- Migrate from byte_views (uses 'byte_serial' column)
INSERT INTO content_views (content_type, identifier, view_count, created_at)
SELECT 'byte', byte_serial, COALESCE(views, 0), COALESCE(created_at, NOW())
FROM byte_views
ON CONFLICT (content_type, identifier) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    updated_at = NOW();

-- Migrate from project_views (uses 'slug' column)
INSERT INTO content_views (content_type, identifier, view_count, created_at)
SELECT 'project', slug, COALESCE(views, 0), COALESCE(created_at, NOW())
FROM project_views
ON CONFLICT (content_type, identifier) DO UPDATE SET
    view_count = EXCLUDED.view_count,
    updated_at = NOW();

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_content_views_lookup ON content_views(content_type, identifier);
CREATE INDEX IF NOT EXISTS idx_content_views_count ON content_views(content_type, view_count DESC);

-- Step 4: Update claps table to support all content types
ALTER TABLE claps DROP CONSTRAINT IF EXISTS claps_post_type_check;
ALTER TABLE claps ADD CONSTRAINT claps_post_type_check 
    CHECK (post_type IN ('bloq', 'blip', 'byte', 'project'));

-- Note: Old tables (bloq_views, blip_views, byte_views, project_views) are kept for now
-- They can be dropped after verification that migration was successful

COMMIT;
