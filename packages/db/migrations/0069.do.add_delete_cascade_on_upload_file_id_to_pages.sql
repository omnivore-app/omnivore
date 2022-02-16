-- Type: DO
-- Name: add_delete_cascade_on_upload_file_id_to_pages
-- Description: Add delete cascade on upload_file_id field on pages table

BEGIN;

ALTER TABLE omnivore.pages
    DROP CONSTRAINT article_upload_file_id_fkey,
    ADD CONSTRAINT pages_upload_file_id_fkey
        FOREIGN KEY (upload_file_id)
        REFERENCES omnivore.upload_files (id)
        ON DELETE CASCADE;

COMMIT;
