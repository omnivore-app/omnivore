-- Type: UNDO
-- Name: drop_original_content
-- Description: Drop original_content column from library_item table

BEGIN;

ALTER TABLE omnivore.library_item ADD COLUMN IF NOT EXISTS original_content text;

COMMIT;
