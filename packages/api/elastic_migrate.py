import json
import psycopg2
from psycopg2.extras import RealDictCursor
from elasticsearch import Elasticsearch, helpers

# export data from postgres to a json file
conn = psycopg2.connect('dbname=omnivore user=app_user password=app_pass')
cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute('''
   SELECT
     p.id, title, description, l.created_at as "createdAt",
     l.updated_at as "updatedAt", url, hash, original_html as "originalHtml",
     content, author, image, published_at as "publishedAt",
     upload_file_id as "uploadFileId", page_type as "pageType",
     user_id as "userId", shared_at as "sharedAt",
     article_reading_progress as "readingProgress",
     article_reading_progress_anchor_index as "readingProgressAnchorIndex",
     saved_at as "savedAt", slug, archived_at as "archivedAt"
   FROM omnivore.pages p
   INNER JOIN omnivore.links l ON p.id = l.article_id
''')


# generate JSON
with open('data.json', 'w') as f:
    f.write(json.dumps(cur.fetchall(), default=str))
    f.close()

print('Exported data to data.json')

# import data from json file to elasticsearch
client = Elasticsearch('http://localhost:9200')


docs = json.load(open('data.json'))

print('String docs length:', len(docs))

doc_list = []
for num, doc in enumerate(docs):
    try:
        # convert the string to a dict object
        dict_doc = {
            '_index': 'pages',
            '_id': doc['id'],
            'doc': doc
        }
        doc_list += [dict_doc]

    except json.decoder.JSONDecodeError as err:
        print('ERROR for num:', num,
              '-- JSONDecodeError:', err, 'for doc:', doc)

print('Dict docs length:', len(doc_list))

try:
    print('\nAttempting to index the list of docs using helpers.bulk()')

    # use the helpers library's Bulk API to index list of Elasticsearch docs
    resp = helpers.bulk(
        client,
        doc_list
    )

    # print the response returned by Elasticsearch
    print('helpers.bulk() RESPONSE:', json.dumps(resp, indent=4))

except Exception as err:
    print('Elasticsearch helpers.bulk() ERROR:', err)
