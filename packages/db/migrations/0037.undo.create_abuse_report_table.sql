-- Type: UNDO
-- Name: create_abuse_report_table
-- Description: Create a new table for saving abuse reports

BEGIN;

DROP TYPE report_type CASCADE;
DROP TABLE omnivore.abuse_reports CASCADE;

COMMIT;
