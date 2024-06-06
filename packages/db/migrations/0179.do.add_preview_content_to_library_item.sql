-- Type: DO
-- Name: add_preview_content_to_library_item
-- Description: Add preview_content column to library_item table

BEGIN;

ALTER TABLE omnivore.library_item
    ADD COLUMN preview_content TEXT;

COMMIT;
