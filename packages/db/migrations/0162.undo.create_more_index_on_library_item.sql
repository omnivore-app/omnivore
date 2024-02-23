-- Type: UNDO
-- Name: create_more_index_on_library_item
-- Description: Create more indexes on omnivore.library_item table to improve query performance

BEGIN;

DROP INDEX IF EXISTS library_item_user_id_state_idx;

COMMIT;
