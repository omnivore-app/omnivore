-- Type: DO
-- Name: allow_admin_to_delete_filters
-- Description: Add permissions to delete data from filters table to the omnivore_admin role

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.filters TO omnivore_admin;

CREATE POLICY filters_admin_policy on omnivore.filters
    FOR ALL
    TO omnivore_admin
    USING (true);

COMMIT;
