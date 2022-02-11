-- Type: DO
-- Name: profiles
-- Description: Create profiles table

BEGIN;

CREATE TABLE omnivore.user_profile (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    username text UNIQUE NOT NULL,
    private boolean NOT NULL DEFAULT false,
    bio text,
    picture_url text,
    user_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    created_at timestamptz NOT NULL default current_timestamp,
    updated_at timestamptz
);

CREATE TRIGGER update_profile_modtime BEFORE UPDATE ON omnivore.user_profile FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE omnivore.user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_user_profile on omnivore.user_profile
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_user_profile on omnivore.user_profile
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_user_profile on omnivore.user_profile
  FOR UPDATE TO omnivore_user
  USING (user_id = omnivore.get_current_user_id());

GRANT SELECT, INSERT, UPDATE ON omnivore.user_profile TO omnivore_user;

COMMIT;
