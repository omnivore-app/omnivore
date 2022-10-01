-- Type: DO
-- Name: subscriptions_icon
-- Description: Add icon field to subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions ADD COLUMN icon text;

COMMIT;
