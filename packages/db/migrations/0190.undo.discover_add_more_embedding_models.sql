-- Type: UNDO
-- Name: discover_add_embeddings
-- Description: Adds more embedding space for use with different models.

BEGIN;

DELETE FROM omnivore.discover_topic_embedding_link;

ALTER TABLE omnivore.discover_topic_embedding_link
DROP COLUMN small_embedding;
ALTER TABLE omnivore.discover_topic_embedding_link
DROP COLUMN large_embedding;
ALTER TABLE omnivore.discover_topic_embedding_link
DROP COLUMN discover_topic_subject;
ALTER TABLE omnivore.discover_feed_article_topic_link
DROP COLUMN discover_topic_subject;

COMMIT;
