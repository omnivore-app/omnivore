-- Type: DO
-- Name: add_index_on_highlight_user_id
-- Description: Add index on user_id column to the highlight table

CREATE INDEX CONCURRENTLY IF NOT EXISTS highlight_user_id_idx ON omnivore.highlight (user_id);
