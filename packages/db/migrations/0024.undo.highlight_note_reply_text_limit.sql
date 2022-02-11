-- Type: UNDO
-- Name: highlight_note_reply_text_limit
-- Description: update text limit on highlight note and reply

BEGIN;

ALTER TABLE omnivore.highlight ALTER COLUMN annotation TYPE varchar(400);

ALTER TABLE omnivore.highlight_reply ALTER COLUMN text TYPE text;

COMMIT;
