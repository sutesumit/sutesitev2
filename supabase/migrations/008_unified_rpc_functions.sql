-- Migration: 008_unified_rpc_functions
-- Description: Create unified RPC functions for content_views table operations
-- Created: 2026-03-25
-- Dependencies: 007_unify_views_and_claps (requires content_views table)

BEGIN;

-- Step 1: Create increment_content_view function
-- Atomically increments view count for a given content type and identifier
-- Returns the new view count after increment
CREATE OR REPLACE FUNCTION increment_content_view(
    p_content_type TEXT,
    p_identifier TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_new_count INTEGER;
BEGIN
    IF p_content_type NOT IN ('bloq', 'blip', 'byte', 'project') THEN
        RAISE EXCEPTION 'Invalid content_type: %', p_content_type;
    END IF;

    INSERT INTO content_views (content_type, identifier, view_count)
    VALUES (p_content_type, p_identifier, 1)
    ON CONFLICT (content_type, identifier) 
    DO UPDATE SET 
        view_count = content_views.view_count + 1,
        updated_at = NOW()
    RETURNING view_count INTO v_new_count;
    
    RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create get_content_view function
-- Retrieves the current view count for a given content type and identifier
-- Returns 0 if no record exists
CREATE OR REPLACE FUNCTION get_content_view(
    p_content_type TEXT,
    p_identifier TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT view_count INTO v_count
    FROM content_views
    WHERE content_type = p_content_type 
      AND identifier = p_identifier;
    
    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 3: Create content_exists helper function
-- Verifies that content exists in the source tables for the given type and identifier
-- Used to validate before performing view increments
CREATE OR REPLACE FUNCTION content_exists(
    p_content_type TEXT,
    p_identifier TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_content_type = 'bloq' THEN
        RETURN EXISTS (SELECT 1 FROM bloq_views WHERE url = p_identifier);
    ELSIF p_content_type = 'project' THEN
        RETURN EXISTS (SELECT 1 FROM project_views WHERE url = p_identifier);
    ELSIF p_content_type = 'blip' THEN
        RETURN EXISTS (SELECT 1 FROM blip_views WHERE blip_serial = p_identifier);
    ELSIF p_content_type = 'byte' THEN
        RETURN EXISTS (SELECT 1 FROM byte_views WHERE byte_serial = p_identifier);
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;