-- Type: UNDO
-- Name: add_state_to_speech
-- Description: Add state field to speech table

BEGIN;

DROP TYPE IF EXISTS speech_state_type;

ALTER TABLE omnivore.speech
    DROP COLUMN bucket,
    DROP COLUMN audio_file_name,
    DROP COLUMN speech_marks_file_name,
    DROP COLUMN state speech_state_type,
    ADD COLUMN audio_url text NOT NULL,
    ADD COLUMN speech_marks_url text NOT NULL;

COMMIT;
