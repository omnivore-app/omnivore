-- Type: DO
-- Name: grant_delete_rls_on_users
-- Description: Add RLS delete permission to the users table

BEGIN;

CREATE POLICY delete_users on omnivore.user
    FOR DELETE TO omnivore_user
    USING (id = omnivore.get_current_user_id());

COMMIT;
