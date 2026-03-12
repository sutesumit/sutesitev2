-- Migration: 001-blip-views
-- Description: Creates blip_views table and increment function
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blip_views (
    serial TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION increment_blip_view(p_serial TEXT)
RETURNS INTEGER AS $$
DECLARE v_views INTEGER;
BEGIN
    INSERT INTO blip_views (serial, views) VALUES (p_serial, 1)
    ON CONFLICT (serial) DO UPDATE
    SET views = blip_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
