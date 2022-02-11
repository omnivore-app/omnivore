-- Type: DO
-- Name: rename_abuse_report_table
-- Description: Rename the abuse report table so it can be used by typeorm more effeciently

BEGIN;

ALTER TABLE omnivore.abuse_reports RENAME TO abuse_report;

ALTER TABLE omnivore.abuse_report
ALTER COLUMN report_types TYPE text[];

DROP TYPE report_type CASCADE;

-- change the foreign key on the abuse_report_id column to be on the abuse_report_id column
ALTER TABLE omnivore.abuse_report DROP CONSTRAINT abuse_reports_reported_by_fkey;
ALTER TABLE omnivore.abuse_report ADD FOREIGN KEY (reported_by) REFERENCES omnivore.user(id);

COMMIT;
