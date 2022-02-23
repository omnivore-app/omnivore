-- Type: DO
-- Name: update_labels_table
-- Description: Update labels table and create link_labels table

BEGIN;

ALTER TABLE omnivore.labels
    DROP COLUMN link_id,
    ADD COLUMN color text NOT NULL DEFAULT '#000000',
    ADD COLUMN description text,
    ADD CONSTRAINT label_name_unique UNIQUE (user_id, name);

CREATE TABLE omnivore.link_labels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    link_id uuid NOT NULL REFERENCES omnivore.links ON DELETE CASCADE,
    label_id uuid NOT NULL REFERENCES omnivore.labels ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (link_id, label_id)
);

GRANT SELECT, INSERT, DELETE ON omnivore.link_labels TO omnivore_user;

COMMIT;
