-- Type: UNDO
-- Name: add_subscriptions_name_index
-- Description: Add an index to the subscriptions name column

BEGIN;

DROP INDEX IF EXISTS omnivore.subscriptions_user_id_name_index;

COMMIT;
