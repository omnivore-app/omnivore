-- Type: DO
-- Name: add_user_id_created_at_index_to_library_item
-- Description: Add an index of columns user_id and created_at to the library_item table for counting query

CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_user_id_created_at_idx ON omnivore.library_item (user_id, created_at);
