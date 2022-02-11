-- Type: DO
-- Name: grant_update_on_newsletter_emails
-- Description: Grant update permission on newsletter_emails table

BEGIN;

GRANT UPDATE ON omnivore.newsletter_emails TO omnivore_user;

COMMIT;
