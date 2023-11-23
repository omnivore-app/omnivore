-- Type: DO
-- Name: update_folder_in_library_item
-- Description: Update folder column in library_item table

BEGIN;

UPDATE omnivore.library_item SET folder = 'inbox' WHERE folder = 'archive' OR folder = 'trash';

COMMIT;
