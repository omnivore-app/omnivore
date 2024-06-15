-- Type: DO
-- Name: post
-- Description: Create a post table

BEGIN;

CREATE TABLE omnivore.post (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id UUID NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    library_item_ids UUID[],
	highlight_ids UUID[],
    title TEXT NOT NULL,
	content TEXT NOT NULL, -- generated from template
	thumbnail TEXT,
	thought TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX post_user_id_idx ON omnivore.post(user_id);

ALTER TABLE omnivore.user_profile ALTER COLUMN private SET DEFAULT true;

COMMIT;
