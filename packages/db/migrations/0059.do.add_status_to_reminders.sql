-- Type: DO
-- Name: add_status_to_reminders
-- Description: Add status, created_at, updated_at fields to the reminders table

BEGIN;

CREATE TYPE reminder_status AS ENUM ('CREATED', 'DELETED', 'COMPLETED');

ALTER TABLE omnivore.reminders
    ADD COLUMN status reminder_status DEFAULT 'CREATED' NOT NULL,
    ADD COLUMN created_at timestamptz NOT NULL default current_timestamp,
    ADD COLUMN updated_at timestamptz;

CREATE TRIGGER reminders_modtime BEFORE UPDATE ON omnivore.reminders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
