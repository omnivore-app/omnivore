-- Type: DO
-- Name: folder_policy
-- Description: Create a folder_policy table to contain the folder expiration policies for user and folder

BEGIN;

CREATE TYPE folder_action AS ENUM ('DELETE', 'ARCHIVE');

CREATE TABLE omnivore.folder_policy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id UUID NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    folder TEXT NOT NULL, -- folder name in lowercase
    action folder_action NOT NULL, -- delete or archive
    after_days INT NOT NULL, -- number of days after which the action should be taken
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, folder, action) -- only one policy per user and folder action
);

CREATE TRIGGER update_folder_policy_modtime BEFORE UPDATE ON omnivore.folder_policy FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.folder_policy TO omnivore_user;

CREATE PROCEDURE omnivore.expire_folders()
LANGUAGE plpgsql
AS $$
DECLARE
    folder_record RECORD;
    folder_name TEXT;
    folder_action folder_action;
    folder_user_id UUID;
    folder_after_days INT;
    old_states library_item_state[];
    new_state library_item_state;
    column_name TEXT;
    folder_policy_cursor CURSOR FOR SELECT id, user_id, folder, action, after_days FROM omnivore.folder_policy;
BEGIN
    FOR folder_record IN folder_policy_cursor LOOP
        folder_user_id := folder_record.user_id;
        folder_name := folder_record.folder;
        folder_action := folder_record.action;
        folder_after_days := folder_record.after_days;

        IF folder_action = 'DELETE' THEN
            old_states := ARRAY['SUCCEEDED', 'FAILED', 'ARCHIVED', 'PROCESSING', 'CONTENT_NOT_FETCHED'::library_item_state];
            new_state := 'DELETED';
            column_name := 'deleted_at';
        ELSIF folder_action = 'ARCHIVE' THEN
            old_states := ARRAY['SUCCEEDED', 'FAILED', 'PROCESSING', 'CONTENT_NOT_FETCHED'::library_item_state];
            new_state := 'ARCHIVED';
            column_name := 'archived_at';
        END IF;

        BEGIN
            PERFORM omnivore.set_claims(folder_user_id, 'omnivore_user');
            
            EXECUTE format('UPDATE omnivore.library_item '
                'SET state = $1, %I = CURRENT_TIMESTAMP '
                'WHERE user_id = $2 AND state = ANY ($3) AND folder = $4 AND created_at < CURRENT_TIMESTAMP - INTERVAL ''$5 days''', column_name) 
                USING new_state, folder_user_id, old_states, folder_name, folder_after_days;

            COMMIT;
        END;
    END LOOP;
END;
$$;

COMMIT;
