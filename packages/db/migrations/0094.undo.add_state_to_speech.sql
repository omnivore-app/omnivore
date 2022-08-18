-- Type: UNDO
-- Name: add_state_to_speech
-- Description: Add state field to speech table

BEGIN;

ALTER TABLE omnivore.speech
    DROP COLUMN bucket,
    DROP COLUMN audio_file_name,
    DROP COLUMN speech_marks_file_name,
    DROP COLUMN state,
    ADD COLUMN audio_url text NOT NULL,
    ADD COLUMN speech_marks_url text NOT NULL;

DROP TYPE IF EXISTS speech_state_type CASCADE;

COMMIT;
