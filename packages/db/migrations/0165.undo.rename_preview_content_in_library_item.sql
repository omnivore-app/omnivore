-- Type: UNDO
-- Name: rename_preview_content_in_library_item
-- Description: Rename preview_content column in library_item table to feed_content

BEGIN;

ALTER TABLE omnivore.highlight DROP COLUMN representation;
DROP TYPE representation_type;

ALTER TABLE omnivore.subscriptions DROP COLUMN fetch_content_type;
DROP TYPE fetch_content_enum;

ALTER TABLE omnivore.library_item RENAME COLUMN feed_content TO preview_content;

COMMIT;
