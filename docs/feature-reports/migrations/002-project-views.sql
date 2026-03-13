-- Migration: 002-project-views
-- Description: Creates project_views table and increment function
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS project_views (
    slug TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION increment_project_view(p_slug TEXT)
RETURNS INTEGER AS $$
DECLARE v_views INTEGER;
BEGIN
    INSERT INTO project_views (slug, views) VALUES (p_slug, 1)
    ON CONFLICT (slug) DO UPDATE
    SET views = project_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
