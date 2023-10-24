-- Type: UNDO
-- Name: alter_user_status_type
-- Description: Add DELETED to the user_status_type enum

BEGIN;

ALTER TYPE user_status_type DROP VALUE IF EXISTS 'DELETED';

COMMIT;
