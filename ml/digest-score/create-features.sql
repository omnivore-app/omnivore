
DROP MATERIALIZED VIEW IF EXISTS user_30d_interactions_site  ;
CREATE MATERIALIZED VIEW user_30d_interactions_site AS
WITH interactions AS (
  SELECT
    li.user_id,
    li.site_name AS site,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.site_name
  HAVING COUNT(*) > 2
),
total_items AS (
  SELECT
    li.user_id,
    li.site_name AS site,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.site_name
)
SELECT
  i.user_id,
  i.site,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.user_id = t.user_id AND i.site = t.site;


DROP MATERIALIZED VIEW IF EXISTS user_30d_interactions_subscription  ;
CREATE MATERIALIZED VIEW user_30d_interactions_subscription AS
WITH interactions AS (
  SELECT
    li.user_id,
    li.subscription,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.subscription
  HAVING COUNT(*) > 2
),
total_items AS (
  SELECT
    li.user_id,
    li.subscription,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.subscription
)
SELECT
  i.user_id,
  i.subscription,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.user_id = t.user_id AND i.subscription = t.subscription;


DROP MATERIALIZED VIEW IF EXISTS user_30d_interactions_author  ;
CREATE MATERIALIZED VIEW user_30d_interactions_author AS
WITH interactions AS (
  SELECT
    li.user_id,
    li.author,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.author
  HAVING COUNT(*) > 2
),
total_items AS (
  SELECT
    li.user_id,
    li.author,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.user_id, li.author
)
SELECT
  i.user_id,
  i.author,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.user_id = t.user_id AND i.author = t.author;



DROP MATERIALIZED VIEW IF EXISTS global_30d_interactions_site;
CREATE MATERIALIZED VIEW global_30d_interactions_site AS
WITH interactions AS (
  SELECT
    li.site_name AS site,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.site_name IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.site_name
  HAVING COUNT(*) > 3
),
total_items AS (
  SELECT
    li.site_name AS site,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.site_name IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.site_name
)
SELECT
  i.site,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.site = t.site;


DROP MATERIALIZED VIEW IF EXISTS global_30d_interactions_subscription ;
CREATE MATERIALIZED VIEW global_30d_interactions_subscription AS
SELECT
  subscription,
  COUNT(*) AS interactions
FROM
  omnivore.library_item li
WHERE
  li.read_at is not null AND
  li.subscription is not NULL AND
  li.created_at >= NOW() - INTERVAL '30 DAYS' AND
  li.created_at < NOW()
GROUP BY
  li.subscription
  HAVING COUNT(*) > 3;


DROP MATERIALIZED VIEW IF EXISTS global_30d_interactions_subscription;
CREATE MATERIALIZED VIEW global_30d_interactions_subscription AS
WITH interactions AS (
  SELECT
    li.subscription,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.subscription IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.subscription
  HAVING COUNT(*) > 3
),
total_items AS (
  SELECT
    li.subscription,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.subscription IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.subscription
)
SELECT
  i.subscription,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.subscription = t.subscription;


DROP MATERIALIZED VIEW IF EXISTS global_30d_interactions_author;
CREATE MATERIALIZED VIEW global_30d_interactions_author AS
WITH interactions AS (
  SELECT
    li.author,
    COUNT(*) AS interactions
  FROM
    omnivore.library_item li
  WHERE
    li.read_at IS NOT NULL AND
    li.author IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.author
  HAVING COUNT(*) > 3
),
total_items AS (
  SELECT
    li.author,
    COUNT(*) AS total_items
  FROM
    omnivore.library_item li
  WHERE
    li.author IS NOT NULL AND
    li.created_at >= NOW() - INTERVAL '30 DAYS' AND
    li.created_at < NOW()
  GROUP BY
    li.author
)
SELECT
  i.author,
  i.interactions,
  t.total_items,
  (i.interactions::float / t.total_items) AS interaction_rate
FROM
  interactions i
JOIN
  total_items t ON i.author = t.author;


DROP MATERIALIZED VIEW IF EXISTS user_7d_activity ;
CREATE MATERIALIZED VIEW user_7d_activity AS
SELECT
  li.id as library_item_id,
  li.user_id,
  li.created_at,

  li.folder as item_folder,

  li.item_type,
  li.item_language AS language,
  li.content_reader,
  li.directionality,
  li.word_count as item_word_count,

  CASE WHEN li.thumbnail IS NOT NULL then 1 else 0 END as item_has_thumbnail,
  CASE WHEN li.site_icon IS NOT NULL then 1 else 0 END as item_has_site_icon,

  li.site_name AS site,
  li.author,
  li.subscription,
  sub.type as item_subscription_type,

  CASE WHEN li.read_at is not NULL then 1 else 0 END as user_clicked,
  CASE WHEN li.reading_progress_bottom_percent > 10 THEN 1 ELSE 0 END AS user_read,
  CASE WHEN li.reading_progress_bottom_percent > 50 THEN 1 ELSE 0 END AS user_long_read

  FROM omnivore.library_item AS li
  LEFT JOIN omnivore.subscriptions sub on li.subscription = sub.name AND sub.user_id = li.user_id
WHERE 
  li.created_at >= NOW() - INTERVAL '21 days' AND
  li.created_at < NOW()
  ;