-- Type: DO
-- Name: newsletter_emails
-- Description: newsletter_emails model

BEGIN;

CREATE TABLE omnivore.newsletter_emails (
    address varchar(50) PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    confirmation_code varchar(50)
);

ALTER TABLE omnivore.newsletter_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_newsletter_emails on omnivore.newsletter_emails
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_newsletter_emails on omnivore.newsletter_emails
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

GRANT SELECT, INSERT ON omnivore.newsletter_emails TO omnivore_user;

COMMIT;
