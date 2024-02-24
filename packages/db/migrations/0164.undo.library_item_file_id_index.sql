-- Type: UNDO
-- Name: library_item_file_id_index
-- Description: create an index for upload_file_id column on library_item table

BEGIN;

DROP INDEX IF EXISTS omnivore.library_item_upload_file_id_idx;

COMMIT;
