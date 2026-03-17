-- Migration: 004_blip_views
-- Description: Creates blip_views table and increment function for glossary blips

CREATE TABLE IF NOT EXISTS public.blip_views (
    blip_serial TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.increment_blip_view(p_serial TEXT)
RETURNS INTEGER AS $$
DECLARE v_views INTEGER;
BEGIN
    INSERT INTO public.blip_views (blip_serial, views) VALUES (p_serial, 1)
    ON CONFLICT (blip_serial) DO UPDATE
    SET views = blip_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER TABLE public.blip_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public blip views are viewable by everyone" 
ON public.blip_views FOR SELECT USING (true);
