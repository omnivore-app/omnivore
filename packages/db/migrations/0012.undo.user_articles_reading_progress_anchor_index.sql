-- Type: UNDO
-- Name: user_articles_reading_progress_anchor_index
-- Description: add reading progress anchor index column

BEGIN;

ALTER TABLE omnivore.user_articles
    DROP column article_reading_progress_anchor_index;
COMMIT;
