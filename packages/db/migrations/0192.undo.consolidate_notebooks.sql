-- Type: UNDO
-- Name: consolidate_notebooks
-- Description: Rollback notebook consolidation (restores type='NOTE' highlights from library_item.note)
--
-- WARNING: This undo is LOSSY. We cannot perfectly restore the deleted highlights because:
-- 1. Original highlight metadata (position, created_at, etc.) is lost
-- 2. We can only recreate highlights from library_item.note
-- 3. Any conflicts that were resolved in favor of library_item.note cannot be restored
--
-- This undo should only be used in emergency situations where the migration caused issues.
-- Recommendation: Do NOT run this unless absolutely necessary. Instead, fix forward.

BEGIN;

-- Step 1: Log current state
DO $$
DECLARE
    notes_in_lib_item integer;
    notes_in_highlights integer;
BEGIN
    SELECT COUNT(*) INTO notes_in_lib_item
    FROM omnivore.library_item
    WHERE note IS NOT NULL AND note != '';

    SELECT COUNT(*) INTO notes_in_highlights
    FROM omnivore.highlight
    WHERE highlight_type = 'NOTE';

    RAISE NOTICE 'Before undo: % notebooks in library_item, % in highlights',
        notes_in_lib_item, notes_in_highlights;

    RAISE WARNING 'Running LOSSY undo migration. Original highlight metadata will not be restored.';
END $$;

-- Step 2: Recreate type='NOTE' highlights from library_item.note
-- Note: This creates NEW highlights, not restoring the originals
INSERT INTO omnivore.highlight (
    user_id,
    library_item_id,
    short_id,
    annotation,
    highlight_type,
    highlight_position_percent,
    highlight_position_anchor_index,
    created_at,
    updated_at
)
SELECT
    li.user_id,
    li.id,
    -- Generate new short_id (original is lost)
    substring(md5(random()::text) from 1 for 8),
    li.note,
    'NOTE'::highlight_type,
    0,  -- Default position (original lost)
    0,  -- Default anchor (original lost)
    COALESCE(li.note_updated_at, li.updated_at, li.created_at),
    COALESCE(li.note_updated_at, li.updated_at, li.created_at)
FROM omnivore.library_item li
WHERE li.note IS NOT NULL
  AND li.note != ''
  -- Only create highlight if one doesn't already exist
  AND NOT EXISTS (
    SELECT 1 FROM omnivore.highlight h
    WHERE h.library_item_id = li.id
      AND h.highlight_type = 'NOTE'
  );

-- Step 3: Remove note_updated_at column
ALTER TABLE omnivore.library_item
DROP COLUMN IF EXISTS note_updated_at;

-- Step 4: Log final state
DO $$
DECLARE
    notes_in_lib_item integer;
    notes_in_highlights integer;
BEGIN
    SELECT COUNT(*) INTO notes_in_lib_item
    FROM omnivore.library_item
    WHERE note IS NOT NULL AND note != '';

    SELECT COUNT(*) INTO notes_in_highlights
    FROM omnivore.highlight
    WHERE highlight_type = 'NOTE';

    RAISE NOTICE 'After undo: % notebooks in library_item, % in highlights',
        notes_in_lib_item, notes_in_highlights;

    RAISE NOTICE 'Undo complete. type=NOTE highlights recreated from library_item.note.';
    RAISE WARNING 'Remember: This is a lossy restoration. Original highlight metadata was not recovered.';
END $$;

-- Step 5: Update table statistics
ANALYZE omnivore.library_item;
ANALYZE omnivore.highlight;

COMMIT;
