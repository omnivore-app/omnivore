-- Type: DO
-- Name: add_remind_at_to_reminders
-- Description: Add remind_at field to reminders table

BEGIN;

CREATE TYPE remind_at AS ENUM ('TONIGHT', 'TOMORROW', 'THIS_WEEKEND', 'NEXT_WEEK');

ALTER TABLE omnivore.reminders
    ADD COLUMN remind_at remind_at NOT NULL;

COMMIT;
