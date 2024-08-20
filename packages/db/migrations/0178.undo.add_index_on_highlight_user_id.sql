-- Type: UNDO
-- Name: add_index_on_highlight_user_id
-- Description: Add index on user_id column to the highlight table

BEGIN;

DROP INDEX IF EXISTS highlight_user_id_idx;

COMMIT;
