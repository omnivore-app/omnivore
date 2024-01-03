-- Type: DO
-- Name: remove_default_folder_in_subscription
-- Description: Remove default value of folder column in subscriptions and newsletter_emails tables

BEGIN;

-- Drop the column first because we can't remove the default value of an existing column
ALTER TABLE omnivore.subscriptions DROP COLUMN folder;
ALTER TABLE omnivore.newsletter_emails DROP COLUMN folder;

ALTER TABLE omnivore.subscriptions ADD COLUMN folder TEXT;
ALTER TABLE omnivore.newsletter_emails ADD COLUMN folder TEXT;

COMMIT;
