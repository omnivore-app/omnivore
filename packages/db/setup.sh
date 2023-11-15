#!/bin/bash

psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "CREATE USER app_user WITH PASSWORD 'app_pass';"  || true
echo "created app_user"
yarn workspace @omnivore/db migrate
psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "GRANT omnivore_user TO app_user;"  || true
echo "granted omnivore_user to app_user"

# create demo user with email: demo@omnivore.app, password: demo_password
USER_ID=$(uuidgen)
PASSWORD='$2a$10$41G6b1BDUdxNjH1QFPJYDOM29EE0C9nTdjD1FoseuQ8vZU1NWtrh6'
psql --host $PG_HOST -U $PG_USER -d $PG_DB -c "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password) VALUES ('$USER_ID', 'EMAIL', 'demo@omnivore.app', 'demo@omnivore.app', 'Demo User', '$PASSWORD'); INSERT INTO omnivore.user_profile (user_id, username) VALUES ('$USER_ID', 'demo_user');"
echo "created demo user with email: demo@omnivore.app, password: demo_password"
