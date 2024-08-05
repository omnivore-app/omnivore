#!/usr/bin/python3
import os

import psycopg2

PG_HOST = os.getenv('PG_HOST', 'localhost')
PG_PORT = os.getenv('PG_PORT', 5432)
PG_USER = os.getenv('PG_USER', 'app_user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'app_pass')
PG_DB = os.getenv('PG_DB', 'omnivore')
PG_TIMEOUT = os.getenv('PG_TIMEOUT', 10)
BATCH_SIZE = os.getenv('BATCH_SIZE', 100)


def batch_update_library_items(conn):
    # update original_content to NULL in batches
    with conn.cursor() as cursor:
        while True:
            cursor.execute(f"""
                UPDATE omnivore.library_item
                SET original_content = NULL
                WHERE id IN (
                    SELECT id
                    FROM omnivore.library_item
                    WHERE original_content IS NOT NULL
                    ORDER BY user_id
                    LIMIT {BATCH_SIZE}
                )
            """)
            conn.commit()

            rows_updated = cursor.rowcount
            if rows_updated == 0:
                break


# postgres connection
conn = psycopg2.connect(
    f'host={PG_HOST} port={PG_PORT} dbname={PG_DB} user={PG_USER} \
    password={PG_PASSWORD} connect_timeout={PG_TIMEOUT}')
print('Postgres connection:', conn.info)

try:
    print('Starting migration')
    batch_update_library_items(conn)
    print('Migration complete')
except Exception as err:
    print('Migration error', err)
finally:
    print('Closing connections')
    conn.close()
