-- Type: UNDO
-- Name: library_item_user_id_published_at_idx
-- Description: Add library_item_user_id_published_at_idx index on library_item table for user_id and published_at

BEGIN;

DROP INDEX IF EXISTS library_item_user_id_published_at_idx;

COMMIT;
