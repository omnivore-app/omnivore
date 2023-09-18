#!/usr/bin/python
import hashlib
import os
import uuid
from collections import deque

import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan as escan

PG_HOST = os.getenv('PG_HOST', 'localhost')
PG_PORT = os.getenv('PG_PORT', 5432)
PG_USER = os.getenv('PG_USER', 'app_user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'app_pass')
PG_DB = os.getenv('PG_DB', 'omnivore')
ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
ES_SCAN_SIZE = os.getenv('ES_SCAN_SIZE', 100)
ES_INDEX = os.getenv('ES_INDEX', 'pages_alias')

CUT_OFF_DATE = os.getenv('CUT_OFF_DATE', '2000-01-01')


def convert_string_to_uuid(val: str):
    hex_string = hashlib.md5(val.encode('UTF-8')).hexdigest()
    return uuid.UUID(hex=hex_string)


# def assertData(conn, client):
#     # get all users from postgres
#     try:
#         success = 0
#         failure = 0
#         cursor = conn.cursor(cursor_factory=RealDictCursor)
#         cursor.execute('''SELECT id FROM omnivore.user''')
#         result = cursor.fetchall()
#         for row in result:
#             userId = row['id']
#             cursor.execute(
#                 f'SELECT COUNT(*) FROM omnivore.links WHERE user_id = \'{userId}\'''')
#             countInPostgres = cursor.fetchone()['count']
#             countInElastic = client.count(
#                 index='pages_alias', body={'query': {'term': {'userId': userId}}})['count']

#             if countInPostgres == countInElastic:
#                 success += 1
#                 print(f'User {userId} OK')
#             else:
#                 failure += 1
#                 print(
#                     f'User {userId} ERROR: postgres: {countInPostgres}, elastic: {countInElastic}')
#         cursor.close()
#         print(f'Asserted data, success: {success}, failure: {failure}')
#     except Exception as err:
#         print('Assert data ERROR:', err)
#         exit(1)


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


def get_data_from_es():
    # elastic client
    client = Elasticsearch(ES_URL, http_auth=(
        ES_USERNAME, ES_PASSWORD), retry_on_timeout=True)
    try:
        print('Elasticsearch client connected', client.info())
    except Exception as err:
        print('Elasticsearch client ERROR:', err)
        exit(1)

    query = {
      "query": {
        "bool": {
          "must": [
            {
              "range": {
                "updatedAt": {
                  "gte": CUT_OFF_DATE
                }
              }
            }
          ]
        }
      },
      "sort": [
        {
          "updatedAt": {
            "order": "desc"
          }
        }
      ]
    }
    # Scan API for larger library
    response = escan(client=client, index=ES_INDEX, query=query,
                     preserve_order=True, size=ES_SCAN_SIZE,
                     request_timeout=30)

    # Initialize a double ended queue
    output = deque()
    # Extend deque with iterator
    output.extend(response)
    # Convert deque to DataFrame
    df = pd.json_normalize(output)
    df = df[[x for x in df.columns if "_source." in x or x == '_id']]

    client.close()
    return df


print('Starting migration')

# get data from elastic
df = get_data_from_es()
print(df.head())

print('Migration complete')
