-- Type: DO
-- Name: grant_delete_on_newsletter_emails
-- Description: Grant DELETE permission on newsletter_emails table

BEGIN;

GRANT DELETE ON omnivore.newsletter_emails TO omnivore_user;

COMMIT;
