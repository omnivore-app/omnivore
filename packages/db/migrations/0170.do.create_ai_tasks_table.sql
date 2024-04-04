-- Type: DO
-- Name: create_ai_tasks_table
-- Description: Create a new table for tracking ai tasks

BEGIN;

CREATE TABLE omnivore.ai_task_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    library_item_id uuid REFERENCES omnivore.library_item(id) ON DELETE CASCADE,

    prompt_name TEXT NOT NULL, -- no explicit reference to allow the prompts to be deleted in the future
    extra_text TEXT,
    requested_at timestamptz NOT NULL default current_timestamp
);

CREATE TABLE omnivore.ai_task_results (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    user_id uuid NOT NULL REFERENCES omnivore.user(id) ON DELETE CASCADE,
    request_id uuid NOT NULL REFERENCES omnivore.ai_task_requests(id),

    result_text TEXT NOT NULL,
    generated_at timestamptz NOT NULL default current_timestamp
);

-- Drop the old one if it was created. It was never used
DROP TABLE IF EXISTS omnivore.ai_prompts;

CREATE TABLE omnivore.ai_prompts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    name TEXT UNIQUE NOT NULL,

    model TEXT NOT NULL,
    model_name TEXT NOT NULL,

    display_text TEXT  NOT NULL,
    template TEXT NOT NULL,
    variables TEXT[],

    created_at timestamptz NOT NULL default current_timestamp
);

CREATE POLICY read_ai_task_requests on omnivore.ai_task_requests
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_ai_task_requests on omnivore.ai_task_requests
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

GRANT SELECT, INSERT ON omnivore.ai_task_requests TO omnivore_user;


CREATE POLICY read_ai_task_results on omnivore.ai_task_results
  FOR SELECT TO omnivore_user
  USING (true);

CREATE POLICY create_ai_task_results on omnivore.ai_task_results
  FOR INSERT TO omnivore_user
  WITH CHECK (true);

CREATE POLICY update_ai_task_results on omnivore.ai_task_results
  FOR UPDATE TO omnivore_user
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON omnivore.ai_task_results TO omnivore_user;

GRANT SELECT ON omnivore.ai_prompts TO omnivore_user;

-- placeholder while we are still debugging 
INSERT INTO omnivore.ai_prompts (name, model, model_name, display_text, template, variables)
VALUES ('preview-document-001',
        'openai',
        'gpt-4-0125-preview',
        'Preview',
        '', '{title, document}');

INSERT INTO omnivore.ai_prompts (name, model, model_name, display_text, template, variables)
VALUES ('summarize-document-001',
        'openai',
        'gpt-4-0125-preview',
        'Summarize',
        '', '{title, document}');

INSERT INTO omnivore.ai_prompts (name, model, model_name, display_text, template, variables)
VALUES ('explain-text-001',
        'openai',
        'gpt-4-0125-preview',
        'Explain',
        '', '{title, document, extraText}');


COMMIT;
