-- Type: UNDO
-- Name: create_features_table
-- Description: Create features table to store opt-in features by users

BEGIN;

DROP TABLE IF EXISTS omnivore.features;

ALTER TABLE omnivore.user_personalization
    DROP COLUMN IF EXISTS speech_secondary_voice,
    ALTER COLUMN speech_rate TYPE integer USING speech_rate::integer,
    ALTER COLUMN speech_volume TYPE integer USING speech_volume::integer;

COMMIT;
