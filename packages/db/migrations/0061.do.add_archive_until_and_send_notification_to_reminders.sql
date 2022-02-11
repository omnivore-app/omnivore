-- Type: DO
-- Name: add_archive_until_and_send_notification_to_reminders
-- Description: Add an archiveUntil and sendNotification flags to the reminders table

BEGIN;


ALTER TABLE omnivore.reminders
  ADD COLUMN archive_until boolean DEFAULT false NOT NULL,
  ADD COLUMN send_notification boolean DEFAULT true NOT NULL ;

COMMIT;
