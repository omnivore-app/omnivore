-- Type: UNDO
-- Name: add_checksum_to_subscriptions_table
-- Description: Add a last fetched checksum field to the subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions DROP COLUMN last_fetched_checksum ;

COMMIT;
