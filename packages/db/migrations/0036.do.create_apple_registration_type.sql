-- Type: DO
-- Name: create_apple_registration_type
-- Description: Adds an APPLE case to the registration type so we can track users that sign in with Apple.

BEGIN;

ALTER TYPE registration_type ADD VALUE IF NOT EXISTS 'APPLE' AFTER 'TWITTER';

COMMIT;
