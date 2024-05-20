-- Type: UNDO
-- Name: drop_library_item_user_id_state_idx
-- Description: Drop multiple-column index for user_id and state columns in library_item table

CREATE INDEX CONCURRENTLY
    IF NOT EXISTS library_item_user_id_state_idx
    ON omnivore.library_item (user_id, state);
