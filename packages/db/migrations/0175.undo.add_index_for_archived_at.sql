-- Type: UNDO
-- Name: add_index_for_archived_at
-- Description: Add index for archived_at column in library_item table

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_user_id_archived_at_idx;

COMMIT;
