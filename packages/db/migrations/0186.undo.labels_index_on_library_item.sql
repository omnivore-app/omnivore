-- Type: UNDO
-- Name: more_index_on_library_item
-- Description: Add index on labels columns to library_item tables for better performance

BEGIN;

DROP INDEX IF EXISTS idx_library_item_state_label_names;

COMMIT;
