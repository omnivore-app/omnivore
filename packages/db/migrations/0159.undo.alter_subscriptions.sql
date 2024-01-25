-- Type: UNDO
-- Name: alter_subscriptions
-- Description: Alter omnivore.subscriptions table to add a new state and date column

BEGIN;

ALTER TABLE omnivore.subscriptions
    RENAME COLUMN most_recent_item_date TO last_fetched_at;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN failed_at,
    DROP COLUMN refreshed_at;

COMMIT;
