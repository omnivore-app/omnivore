-- Type: UNDO
-- Name: add_unique_constraint_in_group_membership
-- Description: Add unique constraint in group_membership table

BEGIN;

ALTER TABLE omnivore.group_membership DROP CONSTRAINT IF EXISTS group_membership_unique;

REVOKE UPDATE ON omnivore.invite FROM omnivore_user;

REVOKE UPDATE ON omnivore.group FROM omnivore_user;

REVOKE UPDATE ON omnivore.group_membership FROM omnivore_user;

COMMIT;
