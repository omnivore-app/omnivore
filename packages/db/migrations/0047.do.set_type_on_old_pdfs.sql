-- Type: DO
-- Name: set_type_on_old_pdfs
-- Description: Set the type on previously uploaded files to FILE

BEGIN;

update omnivore.article set type = 'FILE' where upload_file_id is not null ;

COMMIT;
