-- Type: DO
-- Name: library_item_preview
-- Description: Create library_item_preview table

BEGIN;

CREATE TABLE omnivore.library_item_preview (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    sender_id uuid NOT NULL REFERENCES omnivore.user ON DELETE CASCADE,
    recipient_ids uuid[] NOT NULL, -- Array of user ids
    library_item_id uuid NOT NULL REFERENCES omnivore.library_item(id) ON DELETE CASCADE,
    thumbnail text,
    includes_note bool NOT NULL DEFAULT false,
    includes_highlight bool NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT current_timestamp,
    updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

GRANT SELECT, INSERT ON omnivore.library_item_preview TO omnivore_user;

CREATE TRIGGER update_library_item_preview_modtime BEFORE UPDATE ON omnivore.library_item_preview FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
