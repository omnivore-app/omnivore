-- Type: UNDO
-- Name: add_position_to_labels
-- Description: Add position column to labels table

BEGIN;

DROP TRIGGER IF EXISTS update_label_position ON omnivore.labels;

DROP FUNCTION IF EXISTS update_label_position;

ALTER TABLE omnivore.labels DROP COLUMN IF EXISTS position;

COMMIT;
