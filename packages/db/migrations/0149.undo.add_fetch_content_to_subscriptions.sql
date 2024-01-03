-- Type: UNDO
-- Name: add_fetch_content_to_subscriptions
-- Description: Add fetch_content column to subscriptions tables

BEGIN;

ALTER TABLE omnivore.subscriptions
    DROP COLUMN fetch_content,
    DROP COLUMN folder;

ALTER TABLE omnivore.newsletter_emails
    DROP COLUMN name,
    DROP COLUMN description,
    DROP COLUMN folder;

COMMIT;
