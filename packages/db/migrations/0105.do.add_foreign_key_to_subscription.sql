-- Type: DO
-- Name: add_foreign_key_to_subscription
-- Description: Add newsletter_email_id as foreign key to the subscription table

BEGIN;

ALTER TABLE omnivore.subscriptions
    ADD COLUMN newsletter_email_id uuid REFERENCES omnivore.newsletter_emails(id);

-- migrate existing data
UPDATE omnivore.subscriptions
    SET newsletter_email_id = omnivore.newsletter_emails.id
    FROM omnivore.newsletter_emails
    WHERE omnivore.newsletter_emails.address = omnivore.subscriptions.newsletter_email;

-- remove old column
ALTER TABLE omnivore.subscriptions
    DROP COLUMN newsletter_email;

COMMIT;
