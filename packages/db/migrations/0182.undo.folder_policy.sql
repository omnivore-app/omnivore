-- Type: UNDO
-- Name: folder_policy
-- Description: Create a folder_policy table to contain the folder expiration policies for user and folder

BEGIN;

DROP TABLE omnivore.folder_policy;

DROP TYPE folder_action;

DROP PROCEDURE omnivore.expire_folders();

COMMIT;
