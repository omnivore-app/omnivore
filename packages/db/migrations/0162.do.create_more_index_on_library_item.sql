-- Type: DO
-- Name: create_more_index_on_library_item
-- Description: Create more indexes on omnivore.library_item table to improve query performance

CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_user_id_state_idx ON omnivore.library_item (user_id, state);

