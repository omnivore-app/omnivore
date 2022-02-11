-- Type: DO
-- Name: create_admin_user_table
-- Description: Add a new table for admin users

BEGIN;

CREATE TABLE omnivore.admin_user (id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(), email TEXT NOT NULL, password TEXT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL);

COMMIT;
