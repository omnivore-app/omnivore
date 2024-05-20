-- Type: UNDO
-- Name: add_index_for_library_item_count
-- Description: Add index for counting user items in library_item table

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_count_idx;

COMMIT;
