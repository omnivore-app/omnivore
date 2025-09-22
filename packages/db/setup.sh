#!/bin/bash

psql --host $PG_HOST --username $POSTGRES_USER --command "CREATE DATABASE $PG_DB;" || true
echo "create $PG_DB database"

psql --host $PG_HOST --username $POSTGRES_USER --command "CREATE USER app_user WITH ENCRYPTED PASSWORD '$PG_PASSWORD';" || true
echo "created app_user"

psql --host $PG_HOST --username $POSTGRES_USER --command "CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';" || true
echo "created replicator"

psql --host $PG_HOST --username $POSTGRES_USER --command "SELECT pg_create_physical_replication_slot('replication_slot');" || true
echo "created replication_slot"

PG_USER=$POSTGRES_USER PG_PASSWORD=$PGPASSWORD yarn workspace @omnivore/db migrate

psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command "GRANT omnivore_user TO app_user;" || true
echo "granted omnivore_user to app_user"

# create demo user with configurable credentials
if [ -z "${NO_DEMO_USER}" ]; then
    USER_ID=$(uuidgen)
    DEMO_EMAIL=${DEMO_USER_EMAIL:-"demo@omnivore.app"}
    DEMO_PASSWORD_HASH=${DEMO_USER_PASSWORD_HASH:-'$2a$10$41G6b1BDUdxNjH1QFPJYDOM29EE0C9nTdjD1FoseuQ8vZU1NWtrh6'}
    DEMO_NAME=${DEMO_USER_NAME:-"Demo User"}
    DEMO_USERNAME=${DEMO_USERNAME:-"demo_user"}
    psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password) VALUES ('$USER_ID', 'EMAIL', '$DEMO_EMAIL', '$DEMO_EMAIL', '$DEMO_NAME', '$DEMO_PASSWORD_HASH') ON CONFLICT(email) DO NOTHING; INSERT INTO omnivore.user_profile (user_id, username) VALUES ('$USER_ID', '$DEMO_USERNAME') ON CONFLICT(user_id) DO NOTHING;"
    echo "created demo user with email: $DEMO_EMAIL"
fi
