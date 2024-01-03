-- Type: DO
-- Name: add_source_to_entity_labels
-- Description: Add source column to omnivore.entity_labels table

BEGIN;

ALTER TABLE omnivore.entity_labels ADD COLUMN source TEXT NOT NULL DEFAULT 'user';

COMMIT;
