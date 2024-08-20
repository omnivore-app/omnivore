-- Type: UNDO
-- Name: alter_omnivore_admin_role
-- Description: Alter omnivore_admin role to prevent omnivore_admin to be inherited by app_user or omnivore_user

BEGIN;

DROP POLICY library_item_admin_policy ON omnivore.library_item;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.library_item FROM omnivore_admin;

DROP POLICY user_admin_policy ON omnivore.user;
REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.user FROM omnivore_admin;

REVOKE USAGE ON SCHEMA omnivore FROM omnivore_admin;

DROP ROLE omnivore_admin;

ALTER ROLE omnivore_user INHERIT;

CREATE ROLE omnivore_admin;

GRANT omnivore_admin TO app_user;

GRANT ALL PRIVILEGES ON SCHEMA omnivore TO omnivore_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA omnivore TO omnivore_admin;

CREATE POLICY user_admin_policy on omnivore.user
    FOR ALL
    TO omnivore_admin
    USING (true);

CREATE POLICY library_item_admin_policy on omnivore.library_item
    FOR ALL
    TO omnivore_admin
    USING (true);

COMMIT;
