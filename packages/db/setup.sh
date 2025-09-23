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

# Create users from CSV file if it exists
USERS_FILE="/app/packages/db/users.csv"
if [ -f "$USERS_FILE" ] && [ -z "${NO_DEMO_USER}" ]; then
    echo "Creating users from $USERS_FILE..."

    # Skip header line and process each user
    tail -n +2 "$USERS_FILE" | while IFS=',' read -r email password name username; do
        # Skip empty lines
        [ -z "$email" ] && continue

        # Generate UUID for user
        USER_ID=$(uuidgen)

        # Generate password hash
        echo "Creating user: $email"
        HASH_OUTPUT=$(cd /app && NODE_PATH=/app/node_modules node /usr/local/bin/hash-password.js "$password" 2>&1)
        PASSWORD_HASH=$(echo "$HASH_OUTPUT" | grep "^Hash: " | sed 's/^Hash: //')

        if [ -z "$PASSWORD_HASH" ]; then
            echo "Failed to generate password hash for $email"
            continue
        fi

        # Insert user into database
        psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command \
            "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password)
             VALUES ('$USER_ID', 'EMAIL', '$email', '$email', '$name', '$PASSWORD_HASH')
             ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password = EXCLUDED.password;
             INSERT INTO omnivore.user_profile (user_id, username)
             SELECT omnivore.user.id, '$username'
             FROM omnivore.user
             WHERE email = '$email'
             ON CONFLICT (username) DO UPDATE SET
                user_id = EXCLUDED.user_id;" || true

        echo "Created user: $email"
    done

elif [ -z "${NO_DEMO_USER}" ]; then
    # Fall back to single demo user from environment variables
    echo "No users.csv found, creating single demo user from environment..."

    USER_ID=$(uuidgen)
    DEMO_EMAIL=${DEMO_USER_EMAIL:-"demo@omnivore.app"}

    # Generate hash from plaintext if provided
    if [ -n "$DEMO_USER_PASSWORD" ]; then
        HASH_OUTPUT=$(cd /app && NODE_PATH=/app/node_modules node /usr/local/bin/hash-password.js "$DEMO_USER_PASSWORD" 2>&1)
        DEMO_PASSWORD_HASH=$(echo "$HASH_OUTPUT" | grep "^Hash: " | sed 's/^Hash: //')
    else
        DEMO_PASSWORD_HASH=${DEMO_USER_PASSWORD_HASH:-'$2a$10$41G6b1BDUdxNjH1QFPJYDOM29EE0C9nTdjD1FoseuQ8vZU1NWtrh6'}
    fi

    DEMO_NAME=${DEMO_USER_NAME:-"Demo User"}
    DEMO_USERNAME=${DEMO_USERNAME:-"demo_user"}

    psql --host $PG_HOST --username $POSTGRES_USER --dbname $PG_DB --command \
        "INSERT INTO omnivore.user (id, source, email, source_user_id, name, password)
         VALUES ('$USER_ID', 'EMAIL', '$DEMO_EMAIL', '$DEMO_EMAIL', '$DEMO_NAME', '$DEMO_PASSWORD_HASH')
         ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            password = EXCLUDED.password;
         INSERT INTO omnivore.user_profile (user_id, username)
         SELECT omnivore.user.id, '$DEMO_USERNAME'
         FROM omnivore.user
         WHERE email = '$DEMO_EMAIL'
         ON CONFLICT (username) DO UPDATE SET
            user_id = EXCLUDED.user_id;"

    echo "Created demo user with email: $DEMO_EMAIL"
fi
