-- Type: DO
-- Name: add_state_to_speech
-- Description: Add state field to speech table

BEGIN;

CREATE TYPE speech_state_type AS ENUM ('INITIALIZED', 'COMPLETED', 'FAILED', 'CANCELLED');

ALTER TABLE omnivore.speech
    DROP COLUMN audio_url,
    DROP COLUMN speech_marks_url,
    ADD COLUMN bucket VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN audio_file_name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN speech_marks_file_name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN state speech_state_type NOT NULL DEFAULT 'INITIALIZED';

COMMIT;
