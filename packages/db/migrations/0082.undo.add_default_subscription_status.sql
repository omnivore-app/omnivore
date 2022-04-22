-- Type: UNDO
-- Name: add_default_subscription_status
-- Description: Add default value to subscription status field

BEGIN;

ALTER TABLE omnivore.subscriptions ALTER status DROP DEFAULT;

COMMIT;
