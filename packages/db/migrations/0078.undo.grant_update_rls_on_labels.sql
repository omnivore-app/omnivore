-- Type: UNDO
-- Name: grant_update_rls_on_labels
-- Description: Add RLS update permission to the labels table

BEGIN;

DROP POLICY update_labels on omnivore.labels ;

COMMIT;
