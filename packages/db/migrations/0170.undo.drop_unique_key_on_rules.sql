-- Type: UNDO
-- Name: drop_unique_key_on_rules
-- Description: Drop unique constraint on rules table

BEGIN;

ALTER TABLE omnivore.rules ADD CONSTRAINT rules_user_id_filter_key UNIQUE (user_id, filter);

COMMIT;
