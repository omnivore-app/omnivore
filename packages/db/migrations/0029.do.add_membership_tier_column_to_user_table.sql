-- Type: DO
-- Name: add_membership_type_column_to_user_table
-- Description: Add a new membership type and set it on all users. 

BEGIN;

CREATE TYPE omnivore.membership_tier AS ENUM ('WAIT_LIST', 'BETA');

ALTER TABLE omnivore.user
    ADD column membership omnivore.membership_tier NOT NULL DEFAULT 'WAIT_LIST';

UPDATE omnivore.user SET membership = 'BETA';

COMMIT;
