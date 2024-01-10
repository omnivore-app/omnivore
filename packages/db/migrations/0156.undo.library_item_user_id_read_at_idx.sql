-- Type: UNDO
-- Name: library_item_user_id_read_at_idx
-- Description: Add library_item_user_id_read_at_idx index on library_item table for user_id and read_at

BEGIN;

DROP INDEX IF EXISTS library_item_user_id_read_at_idx;

COMMIT;
