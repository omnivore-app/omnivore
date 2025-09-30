-- Type: DO
-- Name: add_user_roles
-- Description: Add role column to user table for enhanced role-based access control

BEGIN;

-- Create user role enum
CREATE TYPE user_role_type AS ENUM (
  'user',
  'premium', 
  'integration_developer',
  'support',
  'admin',
  'suspended',
  'pending'
);

-- Add role column to user table
ALTER TABLE omnivore.user
ADD COLUMN role user_role_type DEFAULT 'user';

-- Create index for role-based queries
CREATE INDEX idx_user_role ON omnivore.user (role);

-- Update existing users to have 'user' role
UPDATE omnivore.user SET role = 'user' WHERE role IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN omnivore.user.role IS 'User role for role-based access control. Added for NestJS migration.';

COMMIT;