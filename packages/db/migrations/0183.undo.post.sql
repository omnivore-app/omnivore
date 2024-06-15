-- Type: UNDO
-- Name: post
-- Description: Create a post table

BEGIN;

ALTER TABLE omnivore.user_profile ALTER COLUMN private SET DEFAULT false;

DROP TABLE omnivore.post;

COMMIT;
