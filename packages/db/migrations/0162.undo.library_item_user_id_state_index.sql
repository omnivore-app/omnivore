-- Type: UNDO
-- Name: library_item_user_id_state_index
-- Description: Create an index on omnivore.library_item table for querying by user_id and state

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_user_id_state_idx;

COMMIT;
