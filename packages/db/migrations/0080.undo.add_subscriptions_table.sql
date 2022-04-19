-- Type: UNDO
-- Name: add_subscriptions_table
-- Description: Add subscriptions table

BEGIN;

DROP TABLE omnivore.subscriptions;
DROP TYPE subscription_status_type;

COMMIT;
