-- Type: DO
-- Name: library_item_file_id_index
-- Description: create an index for upload_file_id column on library_item table

CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_upload_file_id_idx ON omnivore.library_item (upload_file_id);
