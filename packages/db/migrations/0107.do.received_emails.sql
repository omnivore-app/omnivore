-- Type: DO
-- Name: received_emails
-- Description: Create a table for received emails

BEGIN;

CREATE TABLE omnivore.received_emails (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    "from" text NOT NULL,
    "to" text NOT NULL,
    subject text NOT NULL DEFAULT '',
    "text" text NOT NULL,
    html text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER received_emails_modtime BEFORE UPDATE ON omnivore.received_emails
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON omnivore.received_emails TO omnivore_user;

COMMIT;
