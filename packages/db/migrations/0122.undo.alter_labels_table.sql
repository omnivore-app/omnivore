-- Type: UNDO
-- Name: alter_labels_table
-- Description: Alter labels table

BEGIN;

ALTER TABLE omnivore.abuse_report RENAME COLUMN library_item_id TO elastic_page_id;
ALTER TABLE omnivore.abuse_report ADD COLUMN page_id text;
ALTER TABLE omnivore.content_display_report RENAME COLUMN library_item_id TO elastic_page_id;
ALTER TABLE omnivore.content_display_report ADD COLUMN page_id text;

DROP TRIGGER IF EXISTS entity_labels_update ON omnivore.labels;
DROP FUNCTION IF EXISTS update_entity_labels();
DROP TRIGGER update_labels_modtime ON omnivore.labels;

ALTER TABLE omnivore.labels DROP COLUMN updated_at;

COMMIT;
