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
    minimum_items INT NOT NULL DEFAULT 0, -- minimum number of items to keep in the folder
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, folder) -- only one policy per folder per user
);

CREATE TRIGGER update_folder_policy_modtime BEFORE UPDATE ON omnivore.folder_policy FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.folder_policy TO omnivore_user;

COMMIT;
