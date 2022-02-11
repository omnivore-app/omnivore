#!/bin/bash

psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "CREATE USER app_user WITH PASSWORD 'app_pass';"
echo "created app_user"
yarn workspace @omnivore/db migrate
psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "GRANT omnivore_user TO app_user;"
echo "granted omnivore_user to app_user"