-- Type: DO
-- Name: add_password_to_user
-- Description: Add password field to user table

BEGIN;

ALTER TABLE omnivore.user ADD COLUMN password character varying(255);

COMMIT;
