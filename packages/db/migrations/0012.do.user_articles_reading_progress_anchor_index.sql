-- Type: DO
-- Name: user_articles_reading_progress_anchor_index
-- Description: add reading progress anchor index column

BEGIN;

ALTER TABLE omnivore.user_articles
    ADD column article_reading_progress_anchor_index integer NOT NULL default 0;
COMMIT;
