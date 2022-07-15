-- Type: DO
-- Name: grant_delete_on_user_table
-- Description: Allows the Omnivore User to delete themselves (for delete account app feature)

BEGIN;

GRANT DELETE ON omnivore.user TO omnivore_user;

COMMIT;
