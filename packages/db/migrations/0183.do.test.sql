-- Type: DO
-- Name: test
-- Description: test

BEGIN;

CREATE TABLE omnivore.test (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX test_name_idx ON omnivore.test (name);

COMMIT;
