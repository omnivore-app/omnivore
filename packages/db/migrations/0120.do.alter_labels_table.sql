-- Type: DO
-- Name: alter_labels_table
-- Description: Alter labels table

BEGIN;

ALTER TABLE omnivore.labels ADD COLUMN updated_at timestamptz;

CREATE TRIGGER update_labels_modtime BEFORE UPDATE ON omnivore.labels 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.abuse_report DROP COLUMN page_id;
ALTER TABLE omnivore.abuse_report RENAME COLUMN elastic_page_id TO library_item_id;
ALTER TABLE omnivore.content_display_report DROP COLUMN page_id;
ALTER TABLE omnivore.content_display_report RENAME COLUMN elastic_page_id TO library_item_id;

COMMIT;
