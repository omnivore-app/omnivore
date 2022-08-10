-- Type: UNDO
-- Name: grant_permissions_to_integrations
-- Description: Grant DB permissions to integrations table

BEGIN;

REVOKE SELECT, INSERT, UPDATE, DELETE ON omnivore.integrations FROM omnivore_user;

COMMIT;
