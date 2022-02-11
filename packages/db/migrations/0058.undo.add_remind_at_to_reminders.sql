-- Type: UNDO
-- Name: add_remind_at_to_reminders
-- Description: Add remind_at field to reminders table

BEGIN;

DROP TYPE remind_at CASCADE;

COMMIT;
