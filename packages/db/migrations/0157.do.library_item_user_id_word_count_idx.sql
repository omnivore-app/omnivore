-- Type: DO
-- Name: library_item_user_id_word_count_idx
-- Description: Add library_item_user_id_word_count_idx index on library_item table for user_id and word_count

-- create index for sorting concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_user_id_word_count_idx ON omnivore.library_item (user_id, word_count DESC NULLS LAST);
