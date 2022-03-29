#!/usr/bin/python
import json
import os
from elasticsearch import Elasticsearch

ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
INDEX_SETTINGS = os.getenv('INDEX_SETTINGS', 'index_settings.json')


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


print('Starting migration')

# test elastic client
client = Elasticsearch(ES_URL, http_auth=(
    ES_USERNAME, ES_PASSWORD), retry_on_timeout=True)
try:
    print('Elasticsearch client connected', client.info())
except Exception as err:
    print('Elasticsearch client ERROR:', err)
    exit(1)


update_mappings(client)

client.close()

print('Migration complete')
