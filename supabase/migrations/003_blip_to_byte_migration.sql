-- Migration: 003_blip_to_byte_migration
-- Description: Renames blips to bytes, creates new glossary blips, updates functions.

-- 1. Rename Existing Tables & Columns (Blip -> Byte)
ALTER TABLE IF EXISTS public.blips RENAME TO bytes;
ALTER TABLE IF EXISTS public.blip_views RENAME TO byte_views;

-- Rename columns in bytes
ALTER TABLE public.bytes RENAME COLUMN blip_serial TO byte_serial;

-- Rename columns in byte_views (formerly blip_views)
ALTER TABLE public.byte_views RENAME COLUMN serial TO byte_serial;

-- Rename Sequence for bytes
ALTER SEQUENCE IF EXISTS public.blip_serial_seq RENAME TO byte_serial_seq;

-- Rename Index for bytes
ALTER INDEX IF EXISTS public.idx_blips_serial RENAME TO idx_bytes_serial;

-- 2. Update Functions for Bytes
-- Drop old functions
DROP TRIGGER IF EXISTS trg_set_blip_serial ON public.bytes;
DROP FUNCTION IF EXISTS public.set_blip_serial();
DROP FUNCTION IF EXISTS public.generate_blip_serial();
DROP FUNCTION IF EXISTS public.increment_blip_view(text);

-- Create new Serial Generator for Bytes
CREATE OR REPLACE FUNCTION public.generate_byte_serial()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
  result TEXT := '';
  chars TEXT := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  base INT := 62;
BEGIN
  SELECT nextval('public.byte_serial_seq') INTO seq_val;
  
  IF seq_val = 0 THEN
    RETURN '0';
  END IF;
  
  WHILE seq_val > 0 LOOP
    result := substr(chars, ((seq_val % base) + 1)::INTEGER, 1) || result;
    seq_val := seq_val / base;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Create new Trigger Function for Bytes
CREATE OR REPLACE FUNCTION public.set_byte_serial()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.byte_serial := generate_byte_serial();
  RETURN NEW;
END;
$$;

-- Create Trigger on Bytes
CREATE TRIGGER trg_set_byte_serial
BEFORE INSERT ON public.bytes
FOR EACH ROW
EXECUTE FUNCTION public.set_byte_serial();

-- Create new Increment View Function for Bytes (Temporary until Unified Views)
CREATE OR REPLACE FUNCTION public.increment_byte_view(p_serial text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_views INTEGER;
BEGIN
    INSERT INTO public.byte_views (byte_serial, views) VALUES (p_serial, 1)
    ON CONFLICT (byte_serial) DO UPDATE
    SET views = byte_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$;

-- 3. Create New Blips Table (Glossary)
CREATE TABLE IF NOT EXISTS public.blips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    blip_serial text UNIQUE,
    term text NOT NULL,
    meaning text NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Sequence for new blips
CREATE SEQUENCE IF NOT EXISTS public.blip_glossary_seq START 1;

-- Serial Generator for Glossary Blips
CREATE OR REPLACE FUNCTION public.generate_blip_glossary_serial()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
  result TEXT := '';
  chars TEXT := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  base INT := 62;
BEGIN
  SELECT nextval('public.blip_glossary_seq') INTO seq_val;
  
  IF seq_val = 0 THEN
    RETURN '0';
  END IF;
  
  WHILE seq_val > 0 LOOP
    result := substr(chars, ((seq_val % base) + 1)::INTEGER, 1) || result;
    seq_val := seq_val / base;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Trigger Function for Glossary Serial
CREATE OR REPLACE FUNCTION public.set_blip_glossary_serial()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.blip_serial := generate_blip_glossary_serial();
  RETURN NEW;
END;
$$;

-- Trigger on Blips
CREATE TRIGGER trg_set_blip_glossary_serial
BEFORE INSERT ON public.blips
FOR EACH ROW
EXECUTE FUNCTION public.set_blip_glossary_serial();

-- 4. Security (RLS)
-- Enable RLS
ALTER TABLE public.bytes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.byte_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blips ENABLE ROW LEVEL SECURITY;

-- Policies for Bytes
CREATE POLICY "Public bytes are viewable by everyone" 
ON public.bytes FOR SELECT USING (true);

-- Policies for Byte Views
CREATE POLICY "Public byte views are viewable by everyone" 
ON public.byte_views FOR SELECT USING (true);

-- Policies for Blips (Glossary)
CREATE POLICY "Public blips are viewable by everyone" 
ON public.blips FOR SELECT USING (true);

-- Service Role has full access by default when no policy prevents it (and we are not creating restrict policies for service_role)
-- The absence of INSERT/UPDATE/DELETE policies for 'public' role means only authenticated/service_role can write (if we restrict authenticated).
-- Ideally we want ONLY service_role to write.
