-- Type: UNDO
-- Name: change_type_in_integration
-- Description: Change type field in integration table

BEGIN;

ALTER TABLE omnivore.integrations DROP COLUMN "type";
DROP TYPE omnivore.integration_type;
CREATE TYPE omnivore.integration_type AS ENUM ('READWISE', 'POCKET');
ALTER TABLE omnivore.integrations
    ALTER COLUMN "name" TYPE omnivore.integration_type USING "name"::omnivore.integration_type,
    ADD CONSTRAINT integrations_user_id_type_key UNIQUE (user_id, "name");
ALTER TABLE omnivore.integrations RENAME COLUMN "name" TO "type";

COMMIT;
