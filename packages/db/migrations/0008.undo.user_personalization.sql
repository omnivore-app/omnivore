-- Type: UNDO
-- Name: user_personalization
-- Description: Creates user personalization table

BEGIN;

DROP TRIGGER update_user_personalization_modtime ON omnivore.user_personalization;

DROP TABLE omnivore.user_personalization;

COMMIT;
