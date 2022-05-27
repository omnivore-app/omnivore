-- Type: UNDO
-- Name: webhook_permission
-- Description: webhook table permissions

BEGIN;

REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.webhooks FROM omnivore_user;

COMMIT;
