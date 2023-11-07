-- Type: DO
-- Name: following
-- Description: Create tables for following feature

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD COLUMN is_public boolean,
    ADD COLUMN is_fetching_content boolean;

ALTER TABLE omnivore.library_item
    ADD COLUMN hidden_at timestamptz,
    ADD COLUMN shared_at timestamptz,
    ADD COLUMN shared_by text,
    ADD COLUMN links jsonb,
    ADD COLUMN preview_content text,
    ADD COLUMN seen_at timestamptz,
    ADD COLUMN is_in_library boolean NOT NULL DEFAULT true;

CREATE TABLE omnivore.feed (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    title text NOT NULL,
    url text NOT NULL,
    author text,
    description text,
    image text,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    published_at timestamptz,
    UNIQUE(url)
);

CREATE INDEX feed_title_idx ON omnivore.feed(title);

CREATE TRIGGER update_feed_modtime BEFORE UPDATE ON omnivore.feed FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON omnivore.feed TO omnivore_user;

COMMIT;
