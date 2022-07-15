-- Type: UNDO
-- Name: grant_delete_on_user_table
-- Description: Allows the Omnivore User to delete themselves (for delete account app feature)

BEGIN;

REVOKE DELETE ON omnivore.user FROM omnivore_user;

COMMIT;
