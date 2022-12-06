-- Type: DO
-- Name: add_is_admin_to_group_membership
-- Description: Add is_admin field to group_membership table

BEGIN;

ALTER TABLE omnivore.group_membership ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
