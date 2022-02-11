-- Type: UNDO
-- Name: remove_reminder_type
-- Description: Remove the reminder.type field as the API has been modified to pass this in

BEGIN;

CREATE TYPE reminder_type AS ENUM ('TONIGHT', 'TOMORROW', 'THIS_WEEKEND', 'NEXT_WEEK');

ALTER TABLE omnivore.reminders ADD COLUMN type reminder_type NOT NULL DEFAULT 'TONIGHT';

COMMIT;
