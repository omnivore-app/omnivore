#!/bin/bash

# Check if PGDATA is empty
if [ -z "$(ls -A $PGDATA 2>/dev/null)" ]; then
    echo "PGDATA is empty. Performing basebackup..."
    pg_basebackup -h $PG_HOST -D $PGDATA -U replicator -Fp -Xs -P -R
    echo "Basebackup completed."
else
    echo "PGDATA is not empty. Skipping basebackup and proceeding with normal standby start."
fi

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

# create demo user with email: demo@omnivore.app, password: demo_password (idempotent)
if [ -z "${NO_DEMO_USER}" ]; then
    echo "Checking for demo user..."
    USER_EXISTS=$(psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB -t -c "SELECT COUNT(*) FROM omnivore.user WHERE email='demo@omnivore.app'" | xargs)
    
    if [ "$USER_EXISTS" = "0" ]; then
        echo "Creating demo user..."
        USER_ID=$(uuidgen)
        PASSWORD='$2a$10$41G6b1BDUdxNjH1QFPJYDOM29EE0C9nTdjD1FoseuQ8vZU1NWtrh6'
        psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command "
            INSERT INTO omnivore.user (id, source, email, source_user_id, name, password) 
            VALUES ('$USER_ID', 'EMAIL', 'demo@omnivore.app', 'demo@omnivore.app', 'Demo User', '$PASSWORD')
            ON CONFLICT (email) DO NOTHING;
            
            INSERT INTO omnivore.user_profile (user_id, username) 
            SELECT id, 'demo_user' FROM omnivore.user WHERE email = 'demo@omnivore.app'
            ON CONFLICT (username) DO NOTHING;
        "
        echo "✅ Created demo user with email: demo@omnivore.app, password: demo_password"
    else
        echo "✓ Demo user already exists (skipping creation)"
    fi
else
    echo "NO_DEMO_USER is set - skipping demo user creation"
fi