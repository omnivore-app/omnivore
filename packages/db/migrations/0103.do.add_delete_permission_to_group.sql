-- Type: DO
-- Name: add_delete_permission_to_group
-- Description: Add delete permission to group and membership table

BEGIN;

GRANT DELETE ON omnivore."group" TO omnivore_user;

GRANT DELETE ON omnivore.group_membership TO omnivore_user;

COMMIT;
