-- Type: DO
-- Name: add_checksum_to_subscriptions_table
-- Description: Add a last fetched checksum field to the subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions ADD COLUMN last_fetched_checksum TEXT ;

COMMIT;
