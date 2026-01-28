#!/bin/bash
# Script to retry failed/stuck library items

echo "Checking items stuck in PROCESSING state..."

PROCESSING_COUNT=$(docker exec omnivore-postgres psql -U postgres omnivore -t -c "
SELECT COUNT(*)
FROM omnivore.library_item
WHERE state = 'PROCESSING' AND deleted_at IS NULL;
")

echo "Found $PROCESSING_COUNT items in PROCESSING state"

read -p "Do you want to reset these items to retry? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted"
    exit 0
fi

echo "Resetting items to retry..."

# Delete stuck items so they can be re-saved
docker exec omnivore-postgres psql -U postgres omnivore -c "
DELETE FROM omnivore.library_item
WHERE state = 'PROCESSING'
AND deleted_at IS NULL
AND saved_at < NOW() - INTERVAL '1 hour';
"

echo "Items deleted. You can now re-save the URLs through the UI or API."
echo ""
echo "To get the list of URLs to re-save, run:"
echo "  docker exec omnivore-postgres psql -U postgres omnivore -c \"SELECT original_url FROM omnivore.library_item WHERE state = 'PROCESSING' AND deleted_at IS NULL ORDER BY saved_at DESC;\""
