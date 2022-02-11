-- Type: UNDO
-- Name: user_articles
-- Description: user to article map model

BEGIN;

DROP TRIGGER update_user_articles_modtime ON omnivore.user_articles;

DROP TABLE omnivore.user_articles;

COMMIT;
