-- Type: DO
-- Name: add_type_to_subscriptions
-- Description: Add type, count and last_fetched_at fields to subscriptions table

BEGIN;

CREATE TYPE subscription_type AS ENUM ('NEWSLETTER', 'RSS');

ALTER TABLE omnivore.subscriptions
    ADD COLUMN "type" subscription_type NOT NULL DEFAULT 'NEWSLETTER',
    ADD COLUMN count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN last_fetched_at timestamptz,
    DROP CONSTRAINT subscriptions_user_id_name_key; -- Drop unique constraint on user_id and name

COMMIT;
