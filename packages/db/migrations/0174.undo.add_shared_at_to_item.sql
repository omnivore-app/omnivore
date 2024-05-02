-- Type: UNDO
-- Name: add_shared_at_to_item
-- Description: Add shared_at column to the library_item table

BEGIN;

ALTER TABLE omnivore.library_item DROP COLUMN shared_at;

COMMIT;
