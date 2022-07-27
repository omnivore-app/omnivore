-- Type: UNDO
-- Name: drop_membership_from_user
-- Description: drop membership column from user table

BEGIN;

CREATE TYPE omnivore.membership_tier AS ENUM ('WAIT_LIST', 'BETA');

ALTER TABLE omnivore.user
    ADD column membership omnivore.membership_tier NOT NULL DEFAULT 'WAIT_LIST';

UPDATE omnivore.user SET membership = 'BETA';

COMMIT;
