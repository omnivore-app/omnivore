-- Type: DO
-- Name: grant_update_rls_on_labels
-- Description: Add RLS update permission to the labels table

BEGIN;

CREATE POLICY update_labels on omnivore.labels
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

COMMIT;
