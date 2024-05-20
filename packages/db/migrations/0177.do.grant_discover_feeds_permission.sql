-- Type: DO
-- Name: grant_discover_feeds_permission
-- Description: Grant required permissions on discover_feeds tables to omnivore_user

BEGIN;

GRANT SELECT, INSERT ON omnivore.discover_feed_articles TO omnivore_user;

GRANT SELECT, INSERT ON omnivore.discover_topic_embedding_link TO omnivore_user;

COMMIT;
