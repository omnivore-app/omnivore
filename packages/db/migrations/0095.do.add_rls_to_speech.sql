-- Type: DO
-- Name: add_rls_to_speech
-- Description: Add Row level security to speech table

BEGIN;

CREATE POLICY update_speech on omnivore.speech
    FOR UPDATE TO omnivore_user
    USING (user_id = omnivore.get_current_user_id());

COMMIT;
