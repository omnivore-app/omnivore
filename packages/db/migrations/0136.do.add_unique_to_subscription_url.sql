-- Type: DO
-- Name: add_unique_to_subscription_url
-- Description: Add unique constraint to the url field on the omnivore.subscription table

BEGIN;

-- Deleting duplicates first to avoid unique constraint violation
WITH DuplicateCTE AS (
    SELECT user_id, url, 
           ROW_NUMBER() OVER (PARTITION BY user_id, url ORDER BY (SELECT NULL)) AS RowNum
    FROM omnivore.subscriptions
    WHERE type = 'RSS'
)
DELETE FROM omnivore.subscriptions
    WHERE (user_id, url) IN (SELECT user_id, url FROM DuplicateCTE WHERE RowNum > 1);

ALTER TABLE omnivore.subscriptions ADD CONSTRAINT subscriptions_user_id_url_key UNIQUE (user_id, url);

COMMIT;
