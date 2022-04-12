#!/usr/bin/python
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from elasticsearch import Elasticsearch, NotFoundError

PG_HOST = os.getenv('PG_HOST', 'localhost')
PG_PORT = os.getenv('PG_PORT', 5432)
PG_USER = os.getenv('PG_USER', 'app_user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'app_pass')
PG_DB = os.getenv('PG_DB', 'omnivore')
ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
UPDATE_TIME = os.getenv('UPDATE_TIME', '2019-01-01 00:00:00')
INDEX_SETTINGS = os.getenv('INDEX_SETTINGS', 'index_settings.json')
DATETIME_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'


def update_mappings(client: Elasticsearch):
    print('updating mappings')
    try:
        with open(INDEX_SETTINGS, 'r') as f:
            settings = json.load(f)
            client.indices.put_mapping(
                index='pages_alias',
                body=settings['mappings'])
        print('mappings updated')
    except Exception as err:
        print('update mappings ERROR:', err)
        exit(1)


def assertData(conn, client: Elasticsearch, pages):
    # get all users from postgres
    try:
        success = 0
        failure = 0
        skip = 0
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        for page in pages:
            pageId = page['pageId']
            cursor.execute(
                f'''SELECT COUNT(*) FROM omnivore.highlight
                    WHERE elastic_page_id = \'{pageId}\' AND deleted = false''')
            countInPostgres = cursor.fetchone()['count']
            try:
                countInElastic = len(client.get(
                    index='pages_alias',
                    id=pageId,
                    _source=['highlights'])['_source']['highlights'])
            except NotFoundError as err:
                print('Elasticsearch get ERROR:', err)
                # if page is not found in elasticsearch, skip testing
                skip += 1
                continue

            if countInPostgres == countInElastic:
                success += 1
                print(f'Page {pageId} OK')
            else:
                failure += 1
                print(
                    f'Page {pageId} ERROR: postgres: {countInPostgres}, elastic: {countInElastic}')
        cursor.close()
        print(
            f'Asserted data, success: {success}, failure: {failure}, skip: {skip}')
    except Exception as err:
        print('Assert data ERROR:', err)
        exit(1)


def ingest_highlights(conn, pages):
    try:
        import_count = 0
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        for page in pages:
            pageId = page['pageId']
            query = '''
                SELECT
                    id,
                    quote,
                    prefix,
                    to_char(created_at, '{DATETIME_FORMAT}') as "createdAt",
                    to_char(COALESCE(updated_at, current_timestamp), '{DATETIME_FORMAT}') as "updatedAt",
                    suffix,
                    patch,
                    annotation,
                    short_id as "shortId",
                    user_id as "userId",
                    to_char(shared_at, '{DATETIME_FORMAT}') as "sharedAt"
                FROM omnivore.highlight
                WHERE
                    elastic_page_id = \'{pageId}\'
                    AND deleted = false
                    AND created_at > '{UPDATE_TIME}'
            '''.format(pageId=pageId, DATETIME_FORMAT=DATETIME_FORMAT, UPDATE_TIME=UPDATE_TIME)

            cursor.execute(query)
            result = cursor.fetchall()
            import_count += import_highlights_to_es(client, result, pageId)

            print(f'Imported total {import_count} highlights to es')

        cursor.close()
    except Exception as err:
        print('Export data to json ERROR:', err)


def import_highlights_to_es(client, highlights, pageId) -> int:
    # import highlights to elasticsearch
    print(f'Writing {len(highlights)} highlights to page {pageId}')

    if len(highlights) == 0:
        print('No highlights to import')
        return 0

    try:
        resp = client.update(
            index='pages_alias',
            id=pageId,
            body={'doc': {'highlights': highlights}})

        count = 0
        if resp['result'] == 'updated':
            count = len(highlights)

        print(f'Added {count} highlights to page {pageId}')

        return count
    except Exception as err:
        print('Elasticsearch update ERROR:', err)
        return 0


def get_pages_with_highlights(conn):
    try:
        query = f'''
            SELECT DISTINCT
                elastic_page_id as "pageId"
            FROM omnivore.highlight
            WHERE
                elastic_page_id IS NOT NULL
                AND deleted = false
                AND created_at > '{UPDATE_TIME}'
        '''
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        print('Found pages with highlights:', len(result))
        return result
    except Exception as err:
        print('Get pages with highlights ERROR:', err)


print('Starting migration')

# test elastic client
client = Elasticsearch(ES_URL, http_auth=(
    ES_USERNAME, ES_PASSWORD), retry_on_timeout=True)
try:
    print('Elasticsearch client connected', client.info())
except Exception as err:
    print('Elasticsearch client ERROR:', err)
    exit(1)

# test postgres client
conn = psycopg2.connect(
    f'host={PG_HOST} port={PG_PORT} dbname={PG_DB} user={PG_USER} \
    password={PG_PASSWORD}')
print('Postgres connection:', conn.info)


update_mappings(client)

pages = get_pages_with_highlights(conn)

ingest_highlights(conn, pages)

assertData(conn, client, pages)

client.close()
conn.close()

print('Migration complete')
