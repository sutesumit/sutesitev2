-- Migration: Add blip_serial column with sequential base-62 serials
-- Run this in Supabase SQL Editor

-- Step 1: Add blip_serial column (nullable initially)
ALTER TABLE blips ADD COLUMN IF NOT EXISTS blip_serial TEXT;

-- Step 2: Create sequence for atomic serial generation
CREATE SEQUENCE IF NOT EXISTS blip_serial_seq START 1;

-- Step 3: Create function to generate base-62 serial
CREATE OR REPLACE FUNCTION generate_blip_serial()
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
  result TEXT := '';
  chars TEXT := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  base INT := 62;
BEGIN
  -- Get next value from sequence
  SELECT nextval('blip_serial_seq') INTO seq_val;
  
  -- Convert to base-62
  IF seq_val = 0 THEN
    RETURN '0';
  END IF;
  
  WHILE seq_val > 0 LOOP
    result := substr(chars, (seq_val % base) + 1, 1) || result;
    seq_val := seq_val / base;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Backfill existing blips in chronological order
-- First, set sequence to account for existing rows
SELECT setval('blip_serial_seq', (SELECT COUNT(*) FROM blips));

-- Then backfill with generated serials (oldest first)
WITH ordered_blips AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as row_num
  FROM blips
  WHERE blip_serial IS NULL
),
base62_serials AS (
  SELECT 
    id,
    CASE 
      WHEN row_num = 0 THEN '0'
      ELSE (
        WITH RECURSIVE base62(n, r, result) AS (
          SELECT row_num, row_num % 62, substr('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', (row_num % 62) + 1, 1)
          UNION ALL
          SELECT n / 62, (n / 62) % 62, substr('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ((n / 62) % 62) + 1, 1) || result
          FROM base62 WHERE n >= 62
        )
        SELECT result FROM base62 WHERE n < 62 LIMIT 1
      )
    END as serial
  FROM ordered_blips
)
UPDATE blips b
SET blip_serial = s.serial
FROM base62_serials s
WHERE b.id = s.id;

-- Step 5: Add NOT NULL constraint after backfill
ALTER TABLE blips ALTER COLUMN blip_serial SET NOT NULL;

-- Step 6: Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_blips_serial ON blips(blip_serial);

-- Step 7: Create trigger for auto-generating serials on insert
CREATE OR REPLACE FUNCTION set_blip_serial()
RETURNS TRIGGER AS $$
BEGIN
  NEW.blip_serial := generate_blip_serial();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_set_blip_serial ON blips;
CREATE TRIGGER trg_set_blip_serial
  BEFORE INSERT ON blips
  FOR EACH ROW
  EXECUTE FUNCTION set_blip_serial();

-- Step 8: Verify
SELECT id, blip_serial, created_at FROM blips ORDER BY created_at ASC LIMIT 10;
