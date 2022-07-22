-- Type: DO
-- Name: drop_membership_from_user
-- Description: drop membership column from user table

BEGIN;

ALTER TABLE omnivore.user
    DROP column membership;

DROP TYPE omnivore.membership_tier;

COMMIT;
