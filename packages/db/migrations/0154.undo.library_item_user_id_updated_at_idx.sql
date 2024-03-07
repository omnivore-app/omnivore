-- Type: UNDO
-- Name: library_item_user_id_updated_at_idx
-- Description: Add library_item_user_id_saved_at_idx index on library_item table for user_id and updated_at

BEGIN;

DROP INDEX IF EXISTS library_item_user_id_updated_at_idx;

COMMIT;
