-- Type: UNDO
-- Name: add_folder_to_filters
-- Description: Add folder column to filters table

BEGIN;

ALTER TABLE omnivore.filters DROP COLUMN folder;

COMMIT;
