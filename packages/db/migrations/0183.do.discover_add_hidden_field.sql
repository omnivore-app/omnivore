-- Type: UNDO
-- Name: discover_add_hidden_field
-- Description: Adds the ability to hide a link from discover

BEGIN;

CREATE TABLE omnivore.discover_feed_hide_link (
   discover_article_id uuid NOT NULL REFERENCES omnivore.discover_feed_articles(id) ON DELETE CASCADE,
   user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
   CONSTRAINT user_discover_hide_link UNIQUE(discover_article_id, user_id)
);

CREATE INDEX IF NOT EXISTS user_to_hide_idx ON omnivore.discover_feed_hide_link(user_id, discover_article_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.discover_feed_hide_link to omnivore_user;

COMMIT;
