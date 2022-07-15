-- Type: UNDO
-- Name: grant_delete_rls_on_users
-- Description: Add RLS delete permission to the users table

BEGIN;

DROP POLICY delete_users ON omnivore.user;

COMMIT;
