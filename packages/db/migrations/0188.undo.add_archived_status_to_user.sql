-- Type: UNDO
-- Name: add_archived_status_to_user
-- Description: Add ARCHIVED status to the user table

BEGIN;

ALTER TYPE user_status_type DROP VALUE IF EXISTS 'ARCHIVED';

COMMIT;
