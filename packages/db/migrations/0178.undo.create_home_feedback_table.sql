-- Type: UNDO
-- Name: create_home_feedback_table
-- Description: Create a table for user feedback of the Home feed

BEGIN;

DROP TABLE IF EXISTS omnivore.home_feedback ;
DROP TYPE IF EXISTS omnivore.feedback_type_enum ;


COMMIT;
