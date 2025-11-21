-- Type: UNDO
-- Name: add_highlight_selectors
-- Description: Rollback addition of robust anchored selectors to highlight table

BEGIN;

-- 1) Drop indexes
DROP INDEX IF EXISTS omnivore.highlight_selectors_gin_idx;

DROP INDEX IF EXISTS omnivore.highlight_item_created_idx;

DROP INDEX IF EXISTS omnivore.highlight_user_item_idx;

-- 2) Drop constraint
ALTER TABLE omnivore.highlight
DROP CONSTRAINT IF EXISTS highlight_selectors_textquote_check;

-- 3) Revert color to text type (preserve data)
ALTER TABLE omnivore.highlight
ALTER COLUMN color
DROP DEFAULT,
ALTER COLUMN color
DROP NOT NULL,
ALTER COLUMN color TYPE TEXT USING color::TEXT;

-- 4) Drop new columns
ALTER TABLE omnivore.highlight
DROP COLUMN IF EXISTS content_version,
DROP COLUMN IF EXISTS selectors;

-- 5) Drop enum type if it was created by this migration
-- (Only drop if no other tables use it)
DROP TYPE IF EXISTS omnivore.highlight_color;

COMMIT;