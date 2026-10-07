-- Type: UNDO
-- Name: discover_add_embeddings
-- Description: Adds more embedding space for use with different models.

BEGIN;

DELETE FROM omnivore.discover_topic_embedding_link;

ALTER TABLE omnivore.discover_topic_embedding_link
DROP COLUMN small_embedding vector(1024);
ALTER TABLE omnivore.discover_topic_embedding_link
DROP COLUMN large_embedding vector(4096);


COMMIT;
