-- Type: UNDO
-- Name: add_page_type_to_page
-- Description: Add a type field to the page model. This is based on open graph og:type

BEGIN;

ALTER TABLE omnivore.article DROP COLUMN type;

COMMIT;
