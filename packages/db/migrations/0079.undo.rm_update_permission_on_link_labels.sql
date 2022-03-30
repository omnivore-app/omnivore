-- Type: UNDO
-- Name: rm_update_permission_on_link_labels
-- Description: Remove unneeded update permission on the link_labels table

BEGIN;

GRANT UPDATE ON omnivore.link_labels TO omnivore_user;

COMMIT;
