#!/bin/bash
set -euo pipefail

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-omnivore-postgres}"
PGUSER="${PGUSER:-postgres}"
DBNAME="${DBNAME:-omnivore}"

psql_in_container() {
  docker exec -i "$POSTGRES_CONTAINER" psql -U "$PGUSER" "$DBNAME" -v ON_ERROR_STOP=1 "$@"
}

echo "Postgres container: $POSTGRES_CONTAINER"
echo "Database: $DBNAME"
echo ""

echo "Library item state counts (deleted_at IS NULL):"
psql_in_container -t -c "
SELECT state, COUNT(*) AS count
FROM omnivore.library_item
WHERE deleted_at IS NULL
GROUP BY state
ORDER BY count DESC, state ASC;
" | sed 's/^ *//'
echo ""

echo "PROCESSING age buckets:"
psql_in_container -t -c "
SELECT
  SUM(CASE WHEN saved_at >= NOW() - INTERVAL '15 minutes' THEN 1 ELSE 0 END) AS last_15m,
  SUM(CASE WHEN saved_at <  NOW() - INTERVAL '15 minutes' AND saved_at >= NOW() - INTERVAL '1 hour' THEN 1 ELSE 0 END) AS from_15m_to_1h,
  SUM(CASE WHEN saved_at <  NOW() - INTERVAL '1 hour' AND saved_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) AS from_1h_to_24h,
  SUM(CASE WHEN saved_at <  NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) AS over_24h
FROM omnivore.library_item
WHERE state = 'PROCESSING'
  AND deleted_at IS NULL;
" | sed 's/^ *//'
echo ""

echo "Oldest PROCESSING items:"
psql_in_container -c "
SELECT id, saved_at, updated_at, original_url
FROM omnivore.library_item
WHERE state = 'PROCESSING'
  AND deleted_at IS NULL
ORDER BY saved_at ASC
LIMIT 20;
"
