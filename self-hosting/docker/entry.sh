#!/bin/bash

set -e
DATA_DIR=/var/lib/postgresql/data

mkdir -p "$DATA_DIR"
chown -R postgres:postgres /var/lib/postgresql

if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
  su-exec postgres initdb -D "$DATA_DIR" --auth=trust --encoding=UTF8
  echo "host all all all trust" >> "$DATA_DIR/pg_hba.conf"
  su-exec postgres pg_ctl -D "$DATA_DIR" -w -o "-c listen_addresses=''" start
  su-exec postgres psql -c "CREATE EXTENSION IF NOT EXISTS vector;"
  su-exec postgres pg_ctl -D "$DATA_DIR" -m fast -w stop
fi

exec su-exec postgres postgres -D "$DATA_DIR" -c listen_addresses=* &

sleep 2;

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

# create demo user with email: demo@omnivore.work, password: demo_password
if [ -z "${NO_DEMO_USER}" ]; then
    USER_ID=$(uuidgen)
    PASSWORD='$2a$10$41G6b1BDUdxNjH1QFPJYDOM29EE0C9nTdjD1FoseuQ8vZU1NWtrh6'
    psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password) VALUES ('$USER_ID', 'EMAIL', 'demo@omnivore.work', 'demo@omnivore.work', 'Demo User', '$PASSWORD'); INSERT INTO omnivore.user_profile (user_id, username) VALUES ('$USER_ID', 'demo_user');"
    echo "created demo user with email: demo@omnivore.work, password: demo_password"
fi

exec /app/goproxy & yarn workspace @omnivore/api start& /app/packages/web/env.sh
