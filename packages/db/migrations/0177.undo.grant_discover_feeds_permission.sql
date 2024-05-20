-- Type: UNDO
-- Name: grant_discover_feeds_permission
-- Description: Grant required permissions on discover_feeds tables to omnivore_user

BEGIN;

REVOKE SELECT, INSERT ON omnivore.discover_feed_articles FROM omnivore_user;

REVOKE SELECT, INSERT ON omnivore.discover_topic_embedding_link FROM omnivore_user;

COMMIT;
