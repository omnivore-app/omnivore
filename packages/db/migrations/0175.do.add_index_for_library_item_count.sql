-- Type: DO
-- Name: add_index_for_library_item_count
-- Description: Add index for counting user items in library_item table

CREATE INDEX CONCURRENTLY
    IF NOT EXISTS library_item_count_idx
    ON omnivore.library_item (user_id, state, archived_at, folder);
