-- Type: DO
-- Name: add_scheduled_at_to_subscription
-- Description: Add scheduled_at field to omnivore.subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions ADD COLUMN scheduled_at timestamptz;

COMMIT;
