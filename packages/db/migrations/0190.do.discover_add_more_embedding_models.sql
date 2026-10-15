-- Type: UNDO
-- Name: discover_add_embeddings
-- Description: Adds more embedding space for use with different models.

BEGIN;

DELETE FROM omnivore.discover_topic_embedding_link;

ALTER TABLE omnivore.discover_topic_embedding_link
DROP embedding;

ALTER TABLE omnivore.discover_topic_embedding_link
ADD embedding vector;

ALTER TABLE omnivore.discover_topic_embedding_link
ADD discover_topic_subject text;


ALTER TABLE omnivore.discover_feed_article_topic_link
ADD discover_topic_subject text;

COMMIT;
