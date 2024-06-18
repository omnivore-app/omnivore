-- Type: DO
-- Name: post
-- Description: Create a post table

BEGIN;

CREATE TABLE omnivore.post (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id UUID NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    library_item_ids UUID[] NOT NULL,
	highlight_ids UUID[],
    title TEXT NOT NULL,
	content TEXT NOT NULL, -- generated from template
	thumbnail TEXT,
	thought TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX post_user_id_idx ON omnivore.post(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.post TO omnivore_user;

ALTER TABLE omnivore.post ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_post ON omnivore.post
    FOR SELECT TO omnivore_user
    USING (true);

CREATE POLICY write_post ON omnivore.post
    FOR INSERT TO omnivore_user
    WITH CHECK (user_id = omnivore.get_current_user_id());

CREATE POLICY update_post ON omnivore.post
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

CREATE POLICY delete_post ON omnivore.post
    FOR DELETE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

COMMIT;
