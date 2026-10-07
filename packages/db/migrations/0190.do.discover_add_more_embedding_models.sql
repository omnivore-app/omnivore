-- Type: UNDO
-- Name: discover_add_embeddings
-- Description: Adds more embedding space for use with different models.

BEGIN;

ALTER TABLE omnivore.discover_topic_embedding_link
ADD small_embedding vector(1024);


ALTER TABLE omnivore.discover_topic_embedding_link
ADD large_embedding vector(4096);

DELETE FROM omnivore.discover_topic_embedding_link;


COMMIT;
