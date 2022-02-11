-- Type: DO
-- Name: remove_row_level_security_in_newsletter_emails
-- Description: Remove row level security in newsletter_emails table

BEGIN;

ALTER TABLE omnivore.newsletter_emails DISABLE ROW LEVEL SECURITY;

DROP POLICY read_newsletter_emails on omnivore.newsletter_emails;

DROP POLICY create_newsletter_emails on omnivore.newsletter_emails;

COMMIT;
