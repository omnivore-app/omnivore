-- Type: DO
-- Name: remove_reminder_type
-- Description: Remove the reminder.type field as the API has been modified to pass this in

BEGIN;

ALTER TABLE omnivore.reminders DROP COLUMN type;

DROP type reminder_type;

COMMIT;
