-- Type: UNDO
-- Name: add_type_to_subscriptions
-- Description: Add type, count and last_fetched_at fields to subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD CONSTRAINT subscriptions_user_id_name_key UNIQUE (user_id, name),
    DROP COLUMN last_fetched_at,
    DROP COLUMN count,
    DROP COLUMN "type";

DROP TYPE subscription_type;

COMMIT;
