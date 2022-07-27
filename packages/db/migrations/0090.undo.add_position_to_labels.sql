-- Type: UNDO
-- Name: add_position_to_labels
-- Description: Add position column to labels table

BEGIN;

ALTER TABLE omnivore.labels DROP COLUMN IF EXISTS position;

COMMIT;
