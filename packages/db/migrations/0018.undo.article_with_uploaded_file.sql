-- Type: UNDO
-- Name: article_with_uploaded_file
-- Description: article column pointing to uploaded file

BEGIN;

ALTER TABLE omnivore.article
    DROP COLUMN upload_file_id;

COMMIT;
