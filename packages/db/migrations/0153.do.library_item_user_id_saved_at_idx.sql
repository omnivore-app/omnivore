-- Type: DO
-- Name: library_item_user_id_saved_at_idx
-- Description: Add library_item_user_id_saved_at_idx index on library_item table for user_id and saved_at

-- create index for sorting concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_user_id_saved_at_idx ON omnivore.library_item (user_id, saved_at DESC NULLS LAST);
