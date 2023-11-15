-- Type: UNDO
-- Name: create_omnivore_admin_role
-- Description: Create omnivore_admin role with admin permissions

BEGIN;

DROP POLICY user_admin_policy ON omnivore.user;

REVOKE ALL PRIVILEGES on omnivore.user from omnivore_admin;
REVOKE ALL PRIVILEGES on SCHEMA omnivore from omnivore_admin;

DROP OWNED BY omnivore_admin;

DROP ROLE IF EXISTS omnivore_admin;

COMMIT;
