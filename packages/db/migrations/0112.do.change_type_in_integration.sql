-- Type: DO
-- Name: change_type_in_integration
-- Description: Change type field in integration table

BEGIN;

ALTER TABLE omnivore.integrations RENAME COLUMN "type" TO "name";
ALTER TABLE omnivore.integrations
    DROP CONSTRAINT integrations_user_id_type_key,
    ALTER COLUMN "name" TYPE VARCHAR(40) USING "name"::VARCHAR(40);
DROP TYPE omnivore.integration_type;
CREATE TYPE omnivore.integration_type AS ENUM ('EXPORT', 'IMPORT');
ALTER TABLE omnivore.integrations
    ADD COLUMN "type" omnivore.integration_type NOT NULL DEFAULT 'EXPORT';

COMMIT;
