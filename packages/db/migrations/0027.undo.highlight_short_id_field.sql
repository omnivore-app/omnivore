-- Type: UNDO
-- Name: highlight_short_id_field
-- Description: Add short_id field to omnivore.highlight table

BEGIN;

ALTER TABLE omnivore.highlight
    DROP COLUMN short_id;

COMMIT;
