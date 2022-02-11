-- Type: UNDO
-- Name: rename_abuse_report_table
-- Description: Rename the abuse report table so it can be used by typeorm more effeciently

BEGIN;

CREATE TYPE report_type AS ENUM ('SPAM', 'ABUSIVE', 'CONTENT_VIOLATION');

ALTER TABLE omnivore.abuse_report RENAME TO abuse_reports;

ALTER TABLE omnivore.abuse_reports
ALTER COLUMN report_types TYPE report_type[];

COMMIT;
