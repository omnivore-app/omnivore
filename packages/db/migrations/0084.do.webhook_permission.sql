-- Type: DO
-- Name: webhook_permission
-- Description: webhook table permissions

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON omnivore.webhooks TO omnivore_user;

COMMIT;
