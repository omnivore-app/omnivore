-- Type: UNDO
-- Name: add_internal_field_in_labels
-- Description: Add a new boolean field internal in labels table

BEGIN;

ALTER TABLE omnivore.labels DROP COLUMN IF EXISTS internal;

COMMIT;
