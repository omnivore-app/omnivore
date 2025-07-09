#!/bin/sh

if [ -z "$SERVER_BASE_URL" ]; then
    echo "Error: SERVER_BASE_URL environment variable is not set."
    exit 1
fi

file_contents=$(cat /app/packages/web/public/env.js)
new_contents=${file_contents//\{\{SERVER_BASE_URL\}\}/$SERVER_BASE_URL}
echo "$new_contents" > /app/packages/web/public/env.js

if [ -z "$BASE_URL" ]; then
    echo "Error: BASE_URL environment variable is not set."
    exit 1
fi

file_contents=$(cat /app/packages/web/public/env.js)
new_contents=${file_contents//\{\{BASE_URL\}\}/$BASE_URL}
echo "$new_contents" > /app/packages/web/public/env.js

yarn workspace @omnivore/web start
