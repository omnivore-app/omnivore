-- Type: DO
-- Name: library_item_topic_idx
-- Description: Create index on topic column in library_item table

CREATE INDEX CONCURRENTLY IF NOT EXISTS library_item_topic_idx ON omnivore.library_item USING GIST (topic);
