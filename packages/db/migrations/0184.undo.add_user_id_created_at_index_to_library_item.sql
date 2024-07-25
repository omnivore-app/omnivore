-- Type: UNDO
-- Name: add_user_id_created_at_index_to_library_item
-- Description: Add an index of columns user_id and created_at to the library_item table for counting query

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_user_id_created_at_idx;

COMMIT;
