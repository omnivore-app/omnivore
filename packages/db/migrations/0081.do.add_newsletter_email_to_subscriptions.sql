-- Type: DO
-- Name: add_newsletter_email_to_subscriptions
-- Description: Add newsletter email field to subscriptions table

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD COLUMN newsletter_email TEXT NOT NULL DEFAULT '';

COMMIT;
