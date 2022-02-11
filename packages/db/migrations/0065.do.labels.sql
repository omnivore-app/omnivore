-- Type: DO
-- Name: labels
-- Description: Create labels table

BEGIN;

CREATE TABLE omnivore.labels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    link_id uuid NOT NULL REFERENCES omnivore.links ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    UNIQUE (link_id, name)
);

ALTER TABLE omnivore.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_labels on omnivore.labels
    FOR SELECT TO omnivore_user
    USING (true);

CREATE POLICY create_labels on omnivore.labels
    FOR INSERT TO omnivore_user
    WITH CHECK (true);

CREATE POLICY delete_labels on omnivore.labels
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, DELETE ON omnivore.labels TO omnivore_user;

COMMIT;
