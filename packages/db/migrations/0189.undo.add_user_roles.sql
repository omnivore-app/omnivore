-- Type: UNDO
-- Name: add_user_roles
-- Description: Remove role column and enum from user table

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_user_role;

-- Remove role column
ALTER TABLE omnivore.user DROP COLUMN IF EXISTS role;

-- Drop the enum type
DROP TYPE IF EXISTS user_role_type;

COMMIT;