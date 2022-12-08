-- Type: UNDO
-- Name: add_delete_permission_to_group
-- Description: Add delete permission to group and membership table

BEGIN;

REVOKE DELETE ON omnivore.group_membership FROM omnivore_user;

REVOKE DELETE ON omnivore."group" FROM omnivore_user;

COMMIT;
