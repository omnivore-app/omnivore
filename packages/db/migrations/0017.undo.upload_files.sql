-- Type: UNDO
-- Name: upload_files
-- Description: uploaded files in storage

BEGIN;

DROP POLICY read_upload_file on omnivore.upload_files;

DROP POLICY create_upload_file on omnivore.upload_files;

DROP POLICY update_upload_file on omnivore.upload_files;

DROP TRIGGER upload_files_modtime ON omnivore.upload_files;

DROP TABLE omnivore.upload_files;

DROP TYPE upload_status_type;

COMMIT;
