#!/usr/bin/python
from datetime import datetime
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from elasticsearch import Elasticsearch, helpers

PG_HOST = os.getenv('PG_HOST', 'localhost')
PG_PORT = os.getenv('PG_PORT', 5432)
PG_USER = os.getenv('PG_USER', 'app_user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'app_pass')
PG_DB = os.getenv('PG_DB', 'omnivore')
ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
DATA_FILE = os.getenv('DATA_FILE', 'data.json')
BULK_SIZE = os.getenv('BULK_SIZE', 100)
UPDATE_TIME = os.getenv('UPDATE_TIME', '2019-01-01 00:00:00')
INDEX_SETTINGS = os.getenv('INDEX_SETTINGS', 'index_settings.json')

DATETIME_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
QUERY = f'''
   SELECT
     l.id,
     title,
     description,
     to_char(l.created_at, '{DATETIME_FORMAT}') as "createdAt",
     to_char(l.updated_at, '{DATETIME_FORMAT}') as "updatedAt",
     url,
     hash,
     original_html as "originalHtml",
     content,
     author,
     image,
     to_char(published_at, '{DATETIME_FORMAT}') as "publishedAt",
     upload_file_id as "uploadFileId",
     page_type as "pageType",
     user_id as "userId",
     to_char(shared_at, '{DATETIME_FORMAT}') as "sharedAt",
     article_reading_progress as "readingProgressPercent",
     article_reading_progress_anchor_index as "readingProgressAnchorIndex",
     to_char(saved_at, '{DATETIME_FORMAT}') as "savedAt",
     slug,
     to_char(archived_at, '{DATETIME_FORMAT}') as "archivedAt"
   FROM omnivore.links l
   INNER JOIN omnivore.pages p ON p.id = l.article_id
   WHERE l.updated_at > '{UPDATE_TIME}'
'''

UPDATE_ARTICLE_SAVING_REQUEST_SQL = f'''
    UPDATE
        omnivore.article_saving_request a
    SET
        elastic_page_id = l.id
    FROM
        omnivore.links l
    WHERE
        a.article_id = l.article_id
        AND a.user_id = l.user_id
        AND a.updated_at > '{UPDATE_TIME}'
'''

UPDATE_HIGHLIGHT_SQL = f'''
    UPDATE
        omnivore.highlight h
    SET
        elastic_page_id = l.id
    FROM
        omnivore.links l
    WHERE
        h.article_id = l.article_id
        AND h.user_id = l.user_id
        AND h.updated_at > '{UPDATE_TIME}'
'''


def assertData(conn, client):
    # get all users from postgres
    try:
        success = 0
        failure = 0
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''SELECT id FROM omnivore.user''')
        result = cursor.fetchall()
        for row in result:
            userId = row['id']
            cursor.execute(
                f'SELECT COUNT(*) FROM omnivore.links WHERE user_id = \'{userId}\'''')
            countInPostgres = cursor.fetchone()['count']
            countInElastic = client.count(
                index='pages', body={'query': {'term': {'userId': userId}}})['count']

            if countInPostgres == countInElastic:
                success += 1
                print(f'User {userId} OK')
            else:
                failure += 1
                print(
                    f'User {userId} ERROR: postgres: {countInPostgres}, elastic: {countInElastic}')
        cursor.close()
        print(f'Asserted data, success: {success}, failure: {failure}')
    except Exception as err:
        print('Assert data ERROR:', err)
        exit(1)


def create_index(client):
    print('Creating index')
    try:
        # check if index exists
        if client.indices.exists(index='pages_alias'):
            print('Index already exists')
            return

        # create index
        with open(INDEX_SETTINGS, 'r') as f:
            settings = json.load(f)
            client.indices.create(index='pages', body=settings)
        print('Index created')
    except Exception as err:
        print('Create index ERROR:', err)
        exit(1)


def update_postgres_data(conn, query, table):
    try:
        print('Executing query: {}'.format(query))
        # update data in postgres
        cursor = conn.cursor()
        cursor.execute(query)
        count = cursor.rowcount
        conn.commit()
        cursor.close()
        print(f'Updated {table} in postgres, rows: ', count)
    except Exception as err:
        print('Update postgres data ERROR:', err)


def elastic_bulk_insert(client, doc_list) -> int:
    print('Bulk docs length:', len(doc_list))
    try:
        # use the helpers library's Bulk API to index list of
        # Elasticsearch docs
        resp = helpers.bulk(
            client,
            doc_list,
            request_timeout=30,
        )
        # print the response returned by Elasticsearch
        print('helpers.bulk() RESPONSE:',
              json.dumps(resp, indent=2))
        return resp[0]
    except Exception as err:
        print('Elasticsearch helpers.bulk() ERROR:', err)
        return 0


def ingest_data_to_elastic(conn, query, data_file):
    try:
        print('Executing query: {}'.format(query))
        # export data from postgres
        count = 0
        import_count = 0
        with open(data_file, 'w') as f:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query)

            result = cursor.fetchmany(BULK_SIZE)
            while len(result) > 0:
                print(f'Writing {len(result)} docs to file')
                import_count += import_data_to_es(client, result)
                count += len(result)
                f.write(json.dumps(result, indent=2, default=str))
                result = cursor.fetchmany(BULK_SIZE)

            cursor.close()
        print(f'Exported {count} rows to data.json')
        print(f'Imported {import_count} rows to es')

    except Exception as err:
        print('Export data to json ERROR:', err)


def import_data_to_es(client, docs) -> int:
    # import data to elasticsearch
    print('Importing docs to elasticsearch:', len(docs))

    if len(docs) == 0:
        print('No data to import')
        return 0

    print('Attempting to index the list of docs using helpers.bulk()')

    doc_list = []
    for doc in docs:
        doc['publishedAt'] = validated_date(doc['publishedAt'])
        # convert the string to a dict object
        dict_doc = {
            '_index': 'pages',
            '_id': doc['id'],
            '_source': doc
        }
        doc_list += [dict_doc]

    count = elastic_bulk_insert(client, doc_list)
    print(f'Imported {count} docs to elasticsearch')
    return count


def validated_date(date):
    try:
        if date is None:
            return None

        datetime_object = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%fZ')
        # Make sure the date year is not greater than 9999
        if datetime_object.year > 9999:
            return None

        return date
    except Exception as err:
        print('error validating date', err)
        return None


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

create_index(client)

# ingest data from postgres to es and json file (for debugging)
ingest_data_to_elastic(conn, QUERY, DATA_FILE)

# update existing tables
update_postgres_data(conn, UPDATE_ARTICLE_SAVING_REQUEST_SQL,
                     'article_saving_request')
update_postgres_data(conn, UPDATE_HIGHLIGHT_SQL, 'highlight')

assertData(conn, client)

client.close()
conn.close()

print('Migration complete')
