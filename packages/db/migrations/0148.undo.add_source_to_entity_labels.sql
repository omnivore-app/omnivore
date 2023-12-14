-- Type: UNDO
-- Name: add_source_to_entity_labels
-- Description: Add source column to omnivore.entity_labels table

BEGIN;

ALTER TABLE omnivore.entity_labels DROP COLUMN source;

COMMIT;
