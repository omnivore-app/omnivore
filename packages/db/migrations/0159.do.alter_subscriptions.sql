-- Type: DO
-- Name: alter_subscriptions
-- Description: Alter omnivore.subscriptions table to add a new state and date column

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD COLUMN failed_at timestamptz,
    ADD COLUMN refreshed_at timestamptz;
UPDATE omnivore.subscriptions
    SET refreshed_at = last_fetched_at
    WHERE last_fetched_at IS NOT NULL;

ALTER TABLE omnivore.subscriptions
    RENAME COLUMN last_fetched_at TO most_recent_item_date;

COMMIT;
