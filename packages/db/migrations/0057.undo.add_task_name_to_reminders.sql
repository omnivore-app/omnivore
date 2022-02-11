-- Type: UNDO
-- Name: add_task_name_to_reminders
-- Description: Add task_name field to reminders table

BEGIN;

ALTER TABLE omnivore.reminders
    DROP COLUMN task_name;

COMMIT;
