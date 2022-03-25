-- Type: DO
-- Name: add_created_at_to_newsletter_emails
-- Description: Add created_at and updated_at fields to newsletter_emails table

BEGIN;

ALTER TABLE omnivore.newsletter_emails
    ADD COLUMN created_at timestamptz NOT NULL default current_timestamp,
    ADD COLUMN updated_at timestamptz NOT NULL default current_timestamp;

CREATE TRIGGER newsletter_emails_modtime BEFORE UPDATE ON omnivore.newsletter_emails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
