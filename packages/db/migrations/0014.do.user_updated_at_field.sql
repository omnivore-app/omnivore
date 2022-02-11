-- Type: DO
-- Name: user_unique_email
-- Description: add unique index to email

BEGIN;

ALTER TABLE omnivore.user
   ADD COLUMN updated_at timestamptz NOT NULL DEFAULT current_timestamp;

COMMIT;
