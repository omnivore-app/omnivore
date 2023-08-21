-- Type: DO
-- Name: library_item_subscriptions
-- Description: Create a join table for library item and subscriptions

BEGIN;

CREATE TABLE omnivore.library_item_subscriptions (
    library_item_id uuid NOT NULL REFERENCES omnivore.library_item(id) ON DELETE CASCADE,
    subscription_id uuid NOT NULL REFERENCES omnivore.subscriptions(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, subscription_id)
);

COMMIT;
