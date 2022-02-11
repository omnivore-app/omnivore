-- Type: DO
-- Name: user_unique_email
-- Description: add unique index to email

BEGIN;

ALTER TABLE omnivore.user
    ADD CONSTRAINT email_unique UNIQUE (email);

COMMIT;
