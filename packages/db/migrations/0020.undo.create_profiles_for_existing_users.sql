-- Type: UNDO
-- Name: create_profiles_for_existing_users
-- Description: Create user_profile records for all existing users, migrate their data there and remove redundant fields from omnivore.user table

BEGIN;

ALTER TABLE omnivore.user
    ADD COLUMN source_username text,
    ADD COLUMN bio text,
    ADD COLUMN picture text;

UPDATE omnivore.user u
    SET source_username = p.username,
        bio = p.bio,
        picture = p.picture_url
    FROM omnivore.user_profile p
    WHERE u.id = p.user_id;

COMMIT;
