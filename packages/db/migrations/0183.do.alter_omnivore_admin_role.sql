-- Type: DO
-- Name: alter_omnivore_admin_role
-- Description: Alter omnivore_admin role to prevent omnivore_admin to be inherited by app_user or omnivore_user

BEGIN;

DROP POLICY user_admin_policy ON omnivore.user;
DROP POLICY library_item_admin_policy ON omnivore.library_item;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA omnivore from omnivore_admin;
REVOKE ALL PRIVILEGES ON SCHEMA omnivore from omnivore_admin;

DROP ROLE omnivore_admin;

CREATE ROLE omnivore_admin;

GRANT USAGE ON SCHEMA omnivore TO omnivore_admin;

ALTER ROLE omnivore_user NOINHERIT; -- This is to prevent omnivore_user from inheriting omnivore_admin role

GRANT omnivore_admin TO omnivore_user; -- This is to allow app_user to set omnivore_admin role

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.user TO omnivore_admin;
CREATE POLICY user_admin_policy on omnivore.user
    FOR ALL
    TO omnivore_admin
    USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.library_item TO omnivore_admin;
CREATE POLICY library_item_admin_policy ON omnivore.library_item 
    FOR ALL
    TO omnivore_admin
    USING (true);

COMMIT;
