-- Type: DO
-- Name: rename_preview_content_in_library_item
-- Description: Rename preview_content column in library_item table to feed_content

BEGIN;

ALTER TABLE omnivore.library_item RENAME COLUMN preview_content TO feed_content;

COMMIT;
