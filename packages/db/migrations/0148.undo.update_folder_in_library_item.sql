-- Type: UNDO
-- Name: update_folder_in_library_item
-- Description: Update folder column in library_item table

BEGIN;

UPDATE omnivore.library_item SET folder = 'archive' WHERE archived_at IS NOT NULL;
UPDATE omnivore.library_item SET folder = 'trash' WHERE deleted_at IS NOT NULL;

COMMIT;
