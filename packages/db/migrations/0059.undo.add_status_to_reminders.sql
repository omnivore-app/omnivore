-- Type: UNDO
-- Name: add_status_to_reminders
-- Description: Add status, created_at, updated_at fields to the reminders table

BEGIN;

DROP TRIGGER reminders_modtime ON omnivore.reminders;

DROP TYPE reminder_status CASCADE;

ALTER TABLE omnivore.reminders
    DROP COLUMN created_at,
    DROP COLUMN updated_at;

COMMIT;
