-- Type: DO
-- Name: add_subscriptions_name_index
-- Description: Add an index to the subscriptions name column


CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_name_index ON omnivore.subscriptions (name);

