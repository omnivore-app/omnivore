-- Type: DO
-- Name: user-personalization_margin
-- Description: add margin control to user-personalization

BEGIN;

ALTER TABLE omnivore.user_personalization 
    ADD column margin integer;
COMMIT;
