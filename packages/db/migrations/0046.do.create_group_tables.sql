-- Type: DO
-- Name: create_group_tables
-- Description: Add tables for groups and group memberships

BEGIN;


CREATE TABLE omnivore.group (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  created_by_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,

  name text NOT NULL,

  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER update_group_modtime BEFORE UPDATE ON omnivore.group FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT, INSERT ON omnivore.group TO omnivore_user;


CREATE TABLE omnivore.invite (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  group_id uuid NOT NULL REFERENCES omnivore.group(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,

  code text NOT NULL,
  max_members integer NOT NULL,

  expiration_time timestamptz NOT NULL,

  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER update_invite_modtime BEFORE UPDATE ON omnivore.invite FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT, INSERT ON omnivore.invite TO omnivore_user;


CREATE TABLE omnivore.group_membership (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),

  user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES omnivore.group(id) ON DELETE CASCADE,
  invite_id uuid NOT NULL REFERENCES omnivore.invite(id) ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER update_group_membership_modtime BEFORE UPDATE ON omnivore.group_membership FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
GRANT SELECT, INSERT ON omnivore.group_membership TO omnivore_user;

COMMIT;
