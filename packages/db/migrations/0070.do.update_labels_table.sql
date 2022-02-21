-- Type: DO
-- Name: update_labels_table
-- Description: Update labels table and create link_labels table

BEGIN;

ALTER TABLE omnivore.labels
    DROP COLUMN link_id,
    ADD COLUMN color text NOT NULL,
    ADD COLUMN description text,
    ADD CONSTRAINT label_name_unique UNIQUE (user_id, name);

CREATE TABLE omnivore.link_labels (
    link_id uuid NOT NULL REFERENCES omnivore.links ON DELETE CASCADE,
    label_id uuid NOT NULL REFERENCES omnivore.labels ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT current_timestamp
);

COMMIT;
