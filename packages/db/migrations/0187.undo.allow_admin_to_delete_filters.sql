-- Type: UNDO
-- Name: allow_admin_to_delete_filters
-- Description: Add permissions to delete data from filters table to the omnivore_admin role

BEGIN;

DROP POLICY filters_admin_policy on omnivore.filters;

REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.filters FROM omnivore_admin;

COMMIT;
