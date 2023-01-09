-- Type: UNDO
-- Name: add_foreign_key_to_subscription
-- Description: Add newsletter_email_id as foreign key to the subscription table

BEGIN;

-- remove old column
ALTER TABLE omnivore.subscriptions
    ADD COLUMN newsletter_email text;

-- migrate existing data
UPDATE omnivore.subscriptions
    SET newsletter_email = omnivore.newsletter_emails.address
    FROM omnivore.newsletter_emails
    WHERE omnivore.newsletter_emails.id = omnivore.subscriptions.newsletter_email_id;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN newsletter_email_id;

COMMIT;
