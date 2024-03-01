-- Type: DO
-- Name: add_ai_summary_tables
-- Description: Add tables for generating AI summaries

BEGIN;

CREATE TABLE omnivore.ai_prompts (
	  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp
);

CREATE TABLE omnivore.ai_summaries (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
--    prompt_id uuid NOT NULL REFERENCES omnivore.ai_prompts ON DELETE CASCADE,
    library_item_id uuid NOT NULL REFERENCES omnivore.library_item ON DELETE CASCADE,
    summary TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at timestamptz NOT NULL default current_timestamp
);

CREATE POLICY create_summary on omnivore.ai_summaries
    FOR INSERT TO omnivore_user
    WITH CHECK (true);

GRANT SELECT, INSERT ON omnivore.ai_summaries TO omnivore_user;

COMMIT;
