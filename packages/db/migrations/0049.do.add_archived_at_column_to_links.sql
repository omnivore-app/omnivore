-- Type: DO
-- Name: add_archived_at_column_to_links
-- Description: Add an archivedAt column to the links model

BEGIN;

ALTER TABLE omnivore.links ADD archived_at timestamp;

COMMIT;
