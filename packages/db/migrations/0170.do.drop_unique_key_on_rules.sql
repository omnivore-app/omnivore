-- Type: DO
-- Name: drop_unique_key_on_rules
-- Description: Drop unique constraint on rules table

BEGIN;

ALTER TABLE omnivore.rules DROP CONSTRAINT rules_user_id_filter_key;

COMMIT;
