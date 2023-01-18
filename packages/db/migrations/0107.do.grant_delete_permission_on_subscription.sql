-- Type: DO
-- Name: add_delete_permission_to_subscription
-- Description: Add delete permission to subscription table

BEGIN;

GRANT DELETE ON omnivore.subscriptions TO omnivore_user;

ALTER TABLE omnivore.subscriptions
    DROP CONSTRAINT subscriptions_newsletter_email_id_fkey,
    ADD CONSTRAINT subscriptions_newsletter_email_id_fkey
        FOREIGN KEY (newsletter_email_id)
        REFERENCES omnivore.newsletter_emails (id)
        ON DELETE CASCADE;

COMMIT;
