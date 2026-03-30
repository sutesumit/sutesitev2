-- Migration: 011_compress_visits_to_visitor_state
-- Description: Convert visits into a one-row-per-IP visitor state table with absolute visit counts
-- Created: 2026-03-30

BEGIN;

DROP FUNCTION IF EXISTS public.upsert_visit_state(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  TEXT,
  TEXT
);

DROP FUNCTION IF EXISTS public.get_unique_visitor_count();

CREATE TABLE public.visits_new (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip TEXT NOT NULL,
  network TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  org TEXT,
  postal TEXT,
  timezone TEXT,
  visit_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

WITH ranked_visits AS (
  SELECT
    v.*,
    COUNT(*) OVER (PARTITION BY v.ip) AS grouped_visit_count,
    MIN(v.created_at) OVER (PARTITION BY v.ip) AS grouped_first_seen_at,
    MAX(v.created_at) OVER (PARTITION BY v.ip) AS grouped_last_seen_at,
    ROW_NUMBER() OVER (PARTITION BY v.ip ORDER BY v.created_at DESC, v.id DESC) AS recency_rank
  FROM public.visits AS v
  WHERE v.ip IS NOT NULL
)
INSERT INTO public.visits_new (
  created_at,
  ip,
  network,
  city,
  region,
  country,
  latitude,
  longitude,
  org,
  postal,
  timezone,
  visit_count,
  first_seen_at,
  last_seen_at
)
SELECT
  grouped_last_seen_at,
  ip,
  network,
  city,
  region,
  country,
  latitude,
  longitude,
  org,
  postal,
  timezone,
  grouped_visit_count,
  grouped_first_seen_at,
  grouped_last_seen_at
FROM ranked_visits
WHERE recency_rank = 1;

DROP TABLE public.visits;
ALTER TABLE public.visits_new RENAME TO visits;

ALTER TABLE public.visits
  ADD CONSTRAINT visits_ip_unique UNIQUE (ip);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_visits_last_seen_at ON public.visits (last_seen_at DESC);

CREATE OR REPLACE FUNCTION public.get_unique_visitor_count()
RETURNS BIGINT
LANGUAGE sql
AS $$
  SELECT COUNT(*)::BIGINT FROM public.visits;
$$;

CREATE OR REPLACE FUNCTION public.upsert_visit_state(
  p_ip TEXT,
  p_network TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_postal TEXT DEFAULT NULL,
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_org TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL
)
RETURNS TABLE (
  out_ip TEXT,
  out_network TEXT,
  out_city TEXT,
  out_region TEXT,
  out_country TEXT,
  out_postal TEXT,
  out_latitude DOUBLE PRECISION,
  out_longitude DOUBLE PRECISION,
  out_org TEXT,
  out_timezone TEXT,
  out_visit_count INTEGER,
  out_first_seen_at TIMESTAMPTZ,
  out_last_seen_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  RETURN QUERY
  WITH upserted AS (
    INSERT INTO public.visits (
      created_at,
      ip,
      network,
      city,
      region,
      country,
      latitude,
      longitude,
      org,
      postal,
      timezone,
      visit_count,
      first_seen_at,
      last_seen_at
    )
    VALUES (
      v_now,
      p_ip,
      p_network,
      p_city,
      p_region,
      p_country,
      p_latitude,
      p_longitude,
      p_org,
      p_postal,
      p_timezone,
      1,
      v_now,
      v_now
    )
    ON CONFLICT (ip) DO UPDATE
    SET
      created_at = v_now,
      network = COALESCE(EXCLUDED.network, public.visits.network),
      city = COALESCE(EXCLUDED.city, public.visits.city),
      region = COALESCE(EXCLUDED.region, public.visits.region),
      country = COALESCE(EXCLUDED.country, public.visits.country),
      latitude = COALESCE(EXCLUDED.latitude, public.visits.latitude),
      longitude = COALESCE(EXCLUDED.longitude, public.visits.longitude),
      org = COALESCE(EXCLUDED.org, public.visits.org),
      postal = COALESCE(EXCLUDED.postal, public.visits.postal),
      timezone = COALESCE(EXCLUDED.timezone, public.visits.timezone),
      visit_count = public.visits.visit_count + 1,
      last_seen_at = v_now
    RETURNING public.visits.*
  )
  SELECT
    upserted.ip,
    upserted.network,
    upserted.city,
    upserted.region,
    upserted.country,
    upserted.postal,
    upserted.latitude,
    upserted.longitude,
    upserted.org,
    upserted.timezone,
    upserted.visit_count,
    upserted.first_seen_at,
    upserted.last_seen_at
  FROM upserted;
END;
$$;

COMMIT;
