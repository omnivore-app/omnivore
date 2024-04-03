-- Type: DO
-- Name: add_failed_at_to_rule
-- Description: Add failed_at column to rules table

BEGIN;

ALTER TABLE omnivore.rules ADD COLUMN failed_at timestamptz;

COMMIT;
