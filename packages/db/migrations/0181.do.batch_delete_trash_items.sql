-- Type: DO
-- Name: batch_delete_trash_items
-- Description: Create a function to batch delete library items in trash

BEGIN;

CREATE OR REPLACE PROCEDURE batch_delete_trash_items(
    minimum_items INT
)
RETURNS VOID AS $$
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
        BEGIN;
        
        -- For Row Level Security
        PERFORM omnivore.set_claims(user_record.id, 'omnivore_user');

        -- keep the minimum number of items in trash
        DELETE FROM omnivore.library_item
        WHERE
            user_id = user_record.id
            AND state = 'DELETED'
            AND deleted_at < NOW() - INTERVAL '14 days'
            AND id NOT IN (
                SELECT
                    id
                FROM
                    omnivore.library_item
                WHERE
                    user_id = user_record.id
                    AND state = 'DELETED'
                    AND deleted_at < NOW() - INTERVAL '14 days'
                ORDER BY
                    deleted_at DESC
                LIMIT minimum_items
            );

        COMMIT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;
