#!/bin/bash

psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "CREATE USER app_user WITH PASSWORD 'app_pass';"
echo "created app_user"
yarn workspace @omnivore/db migrate
psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "GRANT omnivore_user TO app_user;"
echo "granted omnivore_user to app_user"

# create demo user with email: demo@omnivore.app, password: demo
USER_ID=$(uuidgen)
PASSWORD='$2a$10$nxdWohvkWWpmQ28aTq0BK./pRgt6/WDrWyArvod8uWqxpFu/cfVoy'
psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password) VALUES ('$USER_ID', 'EMAIL', 'demo@omnivore.app', 'demo@omnivore.app', 'Demo User', '$PASSWORD'); INSERT INTO omnivore.user_profile (user_id, username) VALUES ('$USER_ID', 'demo');"
echo "created demo user with email: demo@omnivore.app, password: demo"
