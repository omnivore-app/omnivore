-- Type: UNDO
-- Name: user_unique_email
-- Description: add unique index to email

BEGIN;

ALTER TABLE omnivore.user
    DROP CONSTRAINT email_unique;

COMMIT;
