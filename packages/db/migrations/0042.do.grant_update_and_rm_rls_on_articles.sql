-- Type: DO
-- Name: grant_update_on_articles
-- Description: Allow articles table to be updated so we can update PDF content async

BEGIN;

GRANT UPDATE ON omnivore.article TO omnivore_user;
ALTER TABLE omnivore.article DISABLE ROW LEVEL SECURITY;

COMMIT;
