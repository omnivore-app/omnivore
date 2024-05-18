-- Type: DO
-- Name: add_index_for_archived_at
-- Description: Add index for archived_at column in library_item table

CREATE INDEX CONCURRENTLY
    IF NOT EXISTS library_item_user_id_archived_at_idx
    ON omnivore.library_item (user_id, archived_at DESC NULLS LAST);
