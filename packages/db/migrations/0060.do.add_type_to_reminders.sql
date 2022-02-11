-- Type: DO
-- Name: add_type_to_reminders
-- Description: Add type field to reminders table

BEGIN;

ALTER TYPE remind_at RENAME TO reminder_type;

ALTER TABLE omnivore.reminders RENAME COLUMN remind_at TO type;
ALTER TABLE omnivore.reminders ADD COLUMN remind_at timestamptz NOT NULL;

COMMIT;
