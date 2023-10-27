-- Type: UNDO
-- Name: feed
-- Description: Create feed, feed_item and user_feed_item tables

BEGIN;

DROP TABLE IF EXISTS omnivore.user_feed_item;

DROP TABLE IF EXISTS omnivore.feed_item;

DROP TABLE IF EXISTS omnivore.feed;

COMMIT;
