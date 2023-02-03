-- Type: UNDO
-- Name: add_default_value_to_text_in_received_emails
-- Description: Add default value to the text field in received_emails table

BEGIN;

ALTER TABLE omnivore.received_emails ALTER COLUMN text DROP DEFAULT;

COMMIT;
