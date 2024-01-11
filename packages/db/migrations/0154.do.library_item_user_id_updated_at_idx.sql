-- Type: DO
-- Name: library_item_user_id_updated_at_idx
-- Description: Add library_item_user_id_saved_at_idx index on library_item table for user_id and updated_at

-- create index for sorting concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_user_id_updated_at_idx ON omnivore.library_item (user_id, updated_at DESC NULLS LAST);
