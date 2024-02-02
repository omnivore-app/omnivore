-- Type: DO
-- Name: drop_slow_db_triggers
-- Description: Drop some db triggers which are slow and have cascading effect

BEGIN;

DROP TRIGGER IF EXISTS library_item_labels_update ON omnivore.entity_labels;
DROP TRIGGER IF EXISTS library_item_highlight_annotations_update ON omnivore.highlight;
DROP TRIGGER IF EXISTS label_names_update ON omnivore.labels;

COMMIT;
