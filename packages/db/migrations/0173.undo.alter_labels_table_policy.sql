-- Type: UNDO
-- Name: alter_labels_table_policy
-- Description: Alter labels table select policy to check user_id

BEGIN;

ALTER POLICY read_labels ON omnivore.labels
    TO omnivore_user
    USING (true);

COMMIT;
