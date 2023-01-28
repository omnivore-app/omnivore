-- Type: DO
-- Name: received_email_trigger_query
-- Description: Fix the received_email trigger query to only clear the current users old emails

BEGIN;

-- Create a trigger to keep the most recent 20 emails for each user
CREATE OR REPLACE FUNCTION omnivore.delete_old_received_emails()
    RETURNS trigger AS $$
    BEGIN
        DELETE FROM omnivore.received_emails
        WHERE user_id = NEW.user_id AND id NOT IN (
            SELECT id FROM omnivore.received_emails
            WHERE user_id = NEW.user_id
            ORDER BY created_at DESC
            LIMIT 20
        );
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

COMMIT;
