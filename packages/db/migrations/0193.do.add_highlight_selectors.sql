-- Type: DO
-- Name: add_highlight_selectors
-- Description: Add robust anchored selectors (JSONB) to highlight table for multi-strategy text positioning

BEGIN;

-- 1) Create highlight_color enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'highlight_color') THEN
    CREATE TYPE omnivore.highlight_color AS ENUM ('yellow', 'red', 'green', 'blue');
  END IF;
END$$;

-- 2) Add new columns for robust highlighting
ALTER TABLE omnivore.highlight
  ADD COLUMN IF NOT EXISTS selectors JSONB,
  ADD COLUMN IF NOT EXISTS content_version VARCHAR(64);

-- 3) Migrate existing highlights to new selectors format
-- Convert quote/prefix/suffix to TextQuote selector
UPDATE omnivore.highlight
SET selectors = jsonb_build_object(
  'textQuote', jsonb_build_object(
    'exact', COALESCE(quote, ''),
    'prefix', CASE WHEN prefix IS NOT NULL AND prefix != '' THEN prefix ELSE NULL END,
    'suffix', CASE WHEN suffix IS NOT NULL AND suffix != '' THEN suffix ELSE NULL END
  )
)
WHERE selectors IS NULL;

-- 4) Make selectors NOT NULL now that all rows have data
ALTER TABLE omnivore.highlight
  ALTER COLUMN selectors SET NOT NULL;

-- 5) Add validation constraint: selectors must contain textQuote
ALTER TABLE omnivore.highlight
  ADD CONSTRAINT highlight_selectors_textquote_check
  CHECK (selectors ? 'textQuote' AND selectors->'textQuote' ? 'exact');

-- 6) Change color column from text to enum (if currently text)
-- First, set any NULL colors to default 'yellow'
UPDATE omnivore.highlight
SET color = 'yellow'
WHERE color IS NULL OR color = '';

-- Drop existing column and recreate with enum type
-- (Safe because we just migrated all data)
ALTER TABLE omnivore.highlight
  ALTER COLUMN color TYPE omnivore.highlight_color
  USING CASE
    WHEN lower(color) = 'red' THEN 'red'::omnivore.highlight_color
    WHEN lower(color) = 'green' THEN 'green'::omnivore.highlight_color
    WHEN lower(color) = 'blue' THEN 'blue'::omnivore.highlight_color
    ELSE 'yellow'::omnivore.highlight_color
  END;

-- Make color NOT NULL with default
ALTER TABLE omnivore.highlight
  ALTER COLUMN color SET NOT NULL,
  ALTER COLUMN color SET DEFAULT 'yellow'::omnivore.highlight_color;

-- 7) Create indexes for common query patterns

-- Fast lookup: user's highlights for a specific item (most common query)
CREATE INDEX IF NOT EXISTS highlight_user_item_idx
  ON omnivore.highlight (user_id, library_item_id);

-- List highlights ordered by creation time for an item
CREATE INDEX IF NOT EXISTS highlight_item_created_idx
  ON omnivore.highlight (library_item_id, created_at DESC);

-- GIN index on selectors JSONB for potential server-side text searches
-- (Optional but useful for future features like searching across highlights)
CREATE INDEX IF NOT EXISTS highlight_selectors_gin_idx
  ON omnivore.highlight
  USING GIN (selectors);

-- 8) Add helpful comment
COMMENT ON COLUMN omnivore.highlight.selectors IS 
'JSONB containing anchored selectors: {textQuote: {exact, prefix?, suffix?}, domRange?: {...}, textPosition?: {...}}';

COMMENT ON COLUMN omnivore.highlight.content_version IS 
'Optional hash/version of content this highlight was created against for version tracking';

COMMIT;