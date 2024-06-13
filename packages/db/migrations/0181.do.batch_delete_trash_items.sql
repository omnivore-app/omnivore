-- Type: DO
-- Name: batch_delete_trash_items
-- Description: Create a function to batch delete library items in trash

BEGIN;

CREATE OR REPLACE PROCEDURE omnivore.batch_delete_trash_items(
    num_days INT
)
LANGUAGE plpgsql AS $$
DECLARE
    user_record RECORD;
    user_cursor CURSOR FOR
    SELECT
        id
    FROM
        omnivore.user
    WHERE
        status = 'ACTIVE';
BEGIN
    FOR user_record IN user_cursor LOOP
        BEGIN
        
            -- For Row Level Security
            PERFORM omnivore.set_claims(user_record.id, 'omnivore_user');

            DELETE FROM omnivore.library_item
            WHERE
                user_id = user_record.id
                AND state = 'DELETED'
                AND deleted_at < NOW() - INTERVAL '1 day' * num_days;

            COMMIT;
        END;
    END LOOP;
END
$$;

COMMIT;
