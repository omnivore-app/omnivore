-- Type: DO
-- Name: rm_article_row_level_security
-- Description: Remove row level security from the article model

BEGIN;

REVOKE GRANT UPDATE ON omnivore.article TO omnivore_user;
ALTER TABLE omnivore.article ENABLE ROW LEVEL SECURITY;

COMMIT;
