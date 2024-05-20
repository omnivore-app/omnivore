-- Type: DO
-- Name: drop_library_item_user_id_state_idx
-- Description: Drop multiple-column index for user_id and state columns in library_item table

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_user_id_state_idx;

COMMIT;
