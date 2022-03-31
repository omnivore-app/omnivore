-- Type: DO
-- Name: rm_update_permission_on_link_labels
-- Description: Remove unneeded update permission on the link_labels table

BEGIN;

REVOKE UPDATE ON omnivore.link_labels FROM omnivore_user;

COMMIT;
