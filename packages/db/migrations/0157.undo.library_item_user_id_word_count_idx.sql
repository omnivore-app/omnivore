-- Type: UNDO
-- Name: library_item_user_id_word_count_idx
-- Description: Add library_item_user_id_word_count_idx index on library_item table for user_id and word_count

BEGIN;

DROP INDEX IF EXISTS library_item_user_id_word_count_idx;

COMMIT;
