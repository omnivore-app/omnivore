-- Type: DO
-- Name: feed
-- Description: Create feed, feed_item and user_feed_item tables

BEGIN;

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

CREATE INDEX IF NOT EXISTS feed_title_idx ON omnivore.feed(title);

CREATE TRIGGER update_feed_modtime BEFORE UPDATE ON omnivore.feed FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON omnivore.feed TO omnivore_user;

CREATE TABLE omnivore.feed_item (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    guid text NOT NULL,
    title text NOT NULL,
    links text[] NOT NULL,
    author text,
    summary text,
    categories text[],
    content text,
    preview_content text,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    published_at timestamptz,
    feed_id uuid NOT NULL REFERENCES omnivore.feed(id) ON DELETE CASCADE,
    UNIQUE(guid)
);

CREATE INDEX IF NOT EXISTS feed_item_feed_id_idx ON omnivore.feed_item(feed_id);

CREATE TRIGGER update_feed_item_modtime BEFORE UPDATE ON omnivore.feed_item FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON omnivore.feed_item TO omnivore_user;

CREATE TABLE omnivore.user_feed_item (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    feed_item_id uuid NOT NULL REFERENCES omnivore.feed_item(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp,
    hidden_at timestamptz,
    saved_at timestamptz
);

CREATE INDEX IF NOT EXISTS user_feed_item_user_id_idx ON omnivore.user_feed_item(user_id);
CREATE INDEX IF NOT EXISTS user_feed_item_feed_item_id_idx ON omnivore.user_feed_item(feed_item_id);

CREATE TRIGGER update_user_feed_item_modtime BEFORE UPDATE ON omnivore.user_feed_item FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.user_feed_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_feed_item_policy ON omnivore.user_feed_item 
    USING (user_id = omnivore.get_current_user_id())
    WITH CHECK (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE ON omnivore.user_feed_item TO omnivore_user;

COMMIT;
