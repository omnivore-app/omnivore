-- Type: UNDO
-- Name: update_labels_table
-- Description: Update labels table and create link_labels table

BEGIN;

ALTER TABLE omnivore.labels
    ADD COLUMN link_id uuid REFERENCES omnivore.links ON DELETE CASCADE,
    DROP COLUMN color,
    DROP COLUMN description,
    DROP CONSTRAINT label_name;

DROP TABLE omnivore.link_labels;

COMMIT;
