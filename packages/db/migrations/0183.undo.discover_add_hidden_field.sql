-- Type: UNDO
-- Name: folder_policy
-- Description: Create a folder_policy table to contain the folder expiration policies for user and folder

BEGIN;

CREATE TABLE omnivore.discover_feed_hide_link (
   discover_article_id uuid NOT NULL REFERENCES omnivore.discover_feed_articles(id) ON DELETE CASCADE,
   user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
   CONSTRAINT user_discover_feed_link UNIQUE(discover_article_id, user_id)
);

CREATE INDEX IF NOT EXISTS user_to_hide_idx ON omnivore.discover_feed_hide_link(user_id);

COMMIT;
