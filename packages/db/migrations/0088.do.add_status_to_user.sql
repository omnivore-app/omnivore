-- Type: DO
-- Name: add_status_to_user
-- Description: Add status to user table

BEGIN;

CREATE TYPE user_status_type AS ENUM ('ACTIVE', 'PENDING');

ALTER TABLE omnivore.user ADD COLUMN status user_status_type NOT NULL DEFAULT 'ACTIVE';

COMMIT;
