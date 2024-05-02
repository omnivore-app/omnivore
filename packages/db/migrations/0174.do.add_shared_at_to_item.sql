-- Type: DO
-- Name: add_shared_at_to_item
-- Description: Add shared_at column to the library_item table

BEGIN;

ALTER TABLE omnivore.library_item ADD column shared_at timestamptz;

COMMIT;
