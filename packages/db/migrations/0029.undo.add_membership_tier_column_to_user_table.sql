-- Type: UNDO
-- Name: add_membership_tier_column_to_user_table
-- Description: Remove membership tier type and column from users table

BEGIN;

ALTER TABLE omnivore.user
    DROP column membership;

DROP TYPE omnivore.membership_tier;

COMMIT;
