-- Type: UNDO
-- Name: speech
-- Description: Add speech table containing text to speech audio_url and speech_marks

BEGIN;

DROP TABLE IF EXISTS omnivore.speech;

ALTER TABLE omnivore.user_personalization
    DROP COLUMN IF EXISTS speech_voice,
    DROP COLUMN IF EXISTS speech_rate,
    DROP COLUMN IF EXISTS speech_volume;

COMMIT;
