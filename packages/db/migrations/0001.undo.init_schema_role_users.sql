-- Type: UNDO
-- Name: users
-- Description: users table

BEGIN;

DROP POLICY read_user on omnivore.user;
DROP POLICY create_user on omnivore.user;
DROP POLICY update_user on omnivore.user;

DROP TRIGGER update_user_modtime ON omnivore.user;

REVOKE ALL PRIVILEGES on SCHEMA omnivore from omnivore_user;
REVOKE ALL PRIVILEGES on omnivore.user from omnivore_user;

DROP FUNCTION omnivore.set_claims(uuid,text);
DROP FUNCTION omnivore.get_current_user_id();

DROP TABLE omnivore.user;
DROP TYPE registration_type;

DROP SCHEMA omnivore CASCADE;
DROP ROLE omnivore_user;
DROP EXTENSION "pgcrypto";
DROP EXTENSION "uuid-ossp" CASCADE;

COMMIT;
