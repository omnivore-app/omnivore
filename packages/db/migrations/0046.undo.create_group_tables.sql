-- Type: UNDO
-- Name: create_group_tables
-- Description: Add tables for groups and group memberships

BEGIN;

DROP TABLE omnivore.group_membership ;
DROP TABLE omnivore.invite ;
DROP TABLE omnivore.group ;

COMMIT;
