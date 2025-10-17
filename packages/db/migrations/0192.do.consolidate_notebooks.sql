-- Type: DO
-- Name: consolidate_notebooks
-- Description: Consolidate notebooks from highlight(type='NOTE') to library_item.note
--
-- Context: The notebook feature was originally stored as a special highlight type='NOTE',
-- but migration 0120 added library_item.note as the preferred location. This migration
-- completes the consolidation by moving any remaining type='NOTE' highlights to the
-- library_item table and removing the redundancy.
--
-- Safety: This is a read-only copy operation. Existing library_item.note values are preserved.
-- If both exist, library_item.note takes precedence (source of truth).

BEGIN;

-- Step 1: Add note_updated_at column to track when notebooks are modified
ALTER TABLE omnivore.library_item
ADD COLUMN IF NOT EXISTS note_updated_at timestamptz;

-- Step 2: Log current state for verification
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

    RAISE NOTICE 'Before migration: % notebooks in library_item, % in highlights',
        notes_in_lib_item, notes_in_highlights;
END $$;

-- Step 3: Migrate notebooks from highlights to library_item
-- Strategy: Only copy if library_item.note is NULL or empty (preserve existing notes)
UPDATE omnivore.library_item li
SET
    note = h.annotation,
    note_updated_at = h.updated_at,
    updated_at = CURRENT_TIMESTAMP
FROM omnivore.highlight h
WHERE h.library_item_id = li.id
  AND h.highlight_type = 'NOTE'
  AND h.annotation IS NOT NULL
  AND h.annotation != ''
  AND (li.note IS NULL OR li.note = '');

-- Step 4: Log conflicts (library items with both note and NOTE highlight)
-- These are cases where library_item.note already exists and differs from highlight
DO $$
DECLARE
    conflict_record RECORD;
    conflict_count integer := 0;
BEGIN
    FOR conflict_record IN
        SELECT
            li.id,
            li.title,
            li.note,
            h.annotation,
            li.updated_at as note_updated,
            h.updated_at as highlight_updated
        FROM omnivore.library_item li
        INNER JOIN omnivore.highlight h ON h.library_item_id = li.id
        WHERE h.highlight_type = 'NOTE'
          AND li.note IS NOT NULL
          AND li.note != ''
          AND h.annotation IS NOT NULL
          AND h.annotation != ''
          AND li.note != h.annotation
    LOOP
        conflict_count := conflict_count + 1;
        RAISE NOTICE 'CONFLICT on library_item % ("%"): library_item.note="%..." (updated %), highlight.annotation="%..." (updated %)',
            conflict_record.id,
            LEFT(conflict_record.title, 30),
            LEFT(conflict_record.note, 40),
            conflict_record.note_updated,
            LEFT(conflict_record.annotation, 40),
            conflict_record.highlight_updated;
    END LOOP;

    IF conflict_count > 0 THEN
        RAISE NOTICE 'Found % conflicts. library_item.note was kept as source of truth.', conflict_count;
    ELSE
        RAISE NOTICE 'No conflicts found. All notebooks consolidated cleanly.';
    END IF;
END $$;

-- Step 5: Delete all type='NOTE' highlights (data now safely in library_item.note)
-- This removes the redundancy and completes the consolidation
DELETE FROM omnivore.highlight
WHERE highlight_type = 'NOTE';

-- Step 6: Log final state
DO $$
DECLARE
    notes_after integer;
    type_note_remaining integer;
BEGIN
    SELECT COUNT(*) INTO notes_after
    FROM omnivore.library_item
    WHERE note IS NOT NULL AND note != '';

    SELECT COUNT(*) INTO type_note_remaining
    FROM omnivore.highlight
    WHERE highlight_type = 'NOTE';

    RAISE NOTICE 'After migration: % notebooks in library_item, % type=NOTE highlights remaining',
        notes_after, type_note_remaining;

    IF type_note_remaining > 0 THEN
        RAISE WARNING 'Unexpected: % type=NOTE highlights still exist after deletion!', type_note_remaining;
    END IF;
END $$;

-- Step 7: Update table statistics for query planner
ANALYZE omnivore.library_item;
ANALYZE omnivore.highlight;

COMMIT;
