-- Type: DO
-- Name: rename_preview_content_in_library_item
-- Description: Rename preview_content column in library_item table to feed_content

BEGIN;

ALTER TABLE omnivore.library_item RENAME COLUMN preview_content TO feed_content;

CREATE TYPE fetch_content_enum AS ENUM ('ALWAYS', 'NEVER', 'WHEN_EMPTY');
ALTER TABLE omnivore.subscriptions ADD COLUMN fetch_content_type fetch_content_enum NOT NULL DEFAULT 'ALWAYS'::fetch_content_enum;

CREATE TYPE representation_type AS ENUM ('CONTENT', 'FEED_CONTENT');
ALTER TABLE omnivore.highlight ADD COLUMN representation representation_type NOT NULL DEFAULT 'CONTENT'::representation_type;
COMMIT;
