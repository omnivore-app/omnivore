-- Type: UNDO
-- Name: integrations
-- Description: Create integrations table

BEGIN;

DROP TABLE IF EXISTS omnivore.integrations;

DROP TYPE IF EXISTS omnivore.integration_type CASCADE;

COMMIT;
