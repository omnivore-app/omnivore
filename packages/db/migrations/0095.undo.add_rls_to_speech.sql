-- Type: UNDO
-- Name: add_rls_to_speech
-- Description: Add Row level security to speech table

BEGIN;

DROP POLICY IF EXISTS update_speech ON omnivore.speech;

COMMIT;
