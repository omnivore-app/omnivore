-- Type: UNDO
-- Name: add_unique_to_subscription_url
-- Description: Add unique constraint to the url field on the omnivore.subscription table

BEGIN;

ALTER TABLE omnivore.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_url_key;

COMMIT;
