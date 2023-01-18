-- Type: UNDO
-- Name: grant_delete_permission_to_subscription
-- Description: Add delete permission to subscription table

BEGIN;

REVOKE DELETE ON omnivore.subscriptions FROM omnivore_user;

ALTER TABLE omnivore.subscriptions
    DROP CONSTRAINT subscriptions_newsletter_email_id_fkey,
    ADD CONSTRAINT subscriptions_newsletter_email_id_fkey
        FOREIGN KEY (newsletter_email_id)
            REFERENCES omnivore.newsletter_emails (id);

COMMIT;
