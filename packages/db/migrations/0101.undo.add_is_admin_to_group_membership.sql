-- Type: UNDO
-- Name: add_is_admin_to_group_membership
-- Description: Add is_admin field to group_membership table

BEGIN;

ALTER TABLE omnivore.group_membership DROP COLUMN IF EXISTS is_admin;

COMMIT;
