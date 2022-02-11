-- Type: DO
-- Name: create_profiles_for_existing_users
-- Description: Create user_profile records for all existing users, migrate their data there and remove redundant fields from omnivore.user table

BEGIN;

-- Create profile records
INSERT INTO omnivore.user_profile (username, bio, picture_url, user_id)
SELECT
    concat_ws('-', split_part(email::text, '@', 1), created_at) as username,
    bio, picture as picture_url, id::uuid as user_id FROM omnivore.user;

-- Remove redundant columns from user table
ALTER TABLE omnivore.user
    DROP COLUMN source_username,
    DROP COLUMN bio,
    DROP COLUMN picture;

COMMIT;
