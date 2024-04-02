-- Type: UNDO
-- Name: create_ai_tasks_table
-- Description: Create a new table for tracking ai tasks

BEGIN;

DROP TABLE IF EXISTS omnivore.ai_task_results;
DROP TABLE IF EXISTS omnivore.ai_task_requests;
DROP TABLE IF EXISTS omnivore.ai_prompts;

COMMIT;
