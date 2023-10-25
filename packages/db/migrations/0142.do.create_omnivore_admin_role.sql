-- Type: DO
-- Name: create_omnivore_admin_role
-- Description: Create omnivore_admin role with admin permissions

BEGIN;

CREATE ROLE omnivore_admin;

GRANT omnivore_admin TO app_user;

GRANT ALL PRIVILEGES ON SCHEMA omnivore TO omnivore_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA omnivore TO omnivore_admin;

CREATE POLICY user_admin_policy on omnivore.user
    FOR ALL
    TO omnivore_admin
    USING (true);

COMMIT;
