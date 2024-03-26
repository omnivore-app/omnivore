-- Type: UNDO
-- Name: add_discover_feed_tables
-- Description: Add Discovery Feed Tables, including counts.

DROP TABLE omnivore.discover_feed;
DROP TABLE omnivore.discover_feed_subscription;
DROP TABLE omnivore.discover_feed_articles;
DROP TABLE omnivore.discover_feed_save_link CASCADE;
DROP TABLE omnivore.discover_feed_article_topic_link;
DROP TABLE omnivore.discover_topics CASCADE;
DROP TABLE omnivore.discover_topic_embedding_link;
