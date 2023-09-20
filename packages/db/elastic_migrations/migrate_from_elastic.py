#!/usr/bin/python
import asyncio
import hashlib
import os
import uuid
from datetime import datetime

import asyncpg
from elasticsearch import AsyncElasticsearch
from elasticsearch.helpers import async_scan

PG_HOST = os.getenv('PG_HOST', 'localhost')
PG_PORT = os.getenv('PG_PORT', 5432)
PG_USER = os.getenv('PG_USER', 'app_user')
PG_PASSWORD = os.getenv('PG_PASSWORD', 'app_pass')
PG_DB = os.getenv('PG_DB', 'omnivore')
ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
ES_SCAN_SIZE = os.getenv('ES_SCAN_SIZE', 10000)
ES_INDEX = os.getenv('ES_INDEX', 'pages_alias')

CUT_OFF_DATE = os.getenv('CUT_OFF_DATE', '2000-01-01')
# ISO 8601 format
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S.%fZ'


async def assert_data(db_conn, es_client, users, uploaded_files):
    # get all users from postgres
    try:
        success = 0
        failure = 0
        for user in users:
            user_id = user['id']
            number_of_docs_in_postgres = await db_conn.fetchval(
                f'SELECT COUNT(*) FROM omnivore.library_item WHERE user_id = \'{user_id}\'')

            query = {
                'size': 0,
                'query': {
                    'bool': {
                        'must': [
                            {
                                'term': {
                                    'userId': user_id
                                }
                            }
                        ],
                        'should': [
                            {
                                'bool': {
                                    'must_not': {
                                        'exists': {
                                            'field': 'uploadFileId'
                                        }
                                    }
                                }
                            },
                            {
                                'terms': {
                                    'uploadFileId': [file['id'] for file in uploaded_files]
                                }
                            }
                        ],
                        'minimum_should_match': 1
                    }
                },
                'aggs': {
                    'unique_urls': {
                        'cardinality': {
                            'field': 'url'
                        }
                    }
                }
            }
            # Get the count of unique URLs for the specified user
            result = await es_client.search(index=ES_INDEX, body=query)
            number_of_docs_in_elastic = result['aggregations']['unique_urls']['value']

            if number_of_docs_in_postgres == number_of_docs_in_elastic:
                success += 1
                print(f'User {user_id} OK')
            else:
                failure += 1
                print(
                    f'User {user_id} ERROR: postgres: {number_of_docs_in_postgres}, elastic: {number_of_docs_in_elastic}')
        print(f'Asserted data, success: {success}, failure: {failure}')
    except Exception as err:
        print('Assert data ERROR:', err)


def get_uuid(val):
    try:
        uuid.UUID(val, version=4)
        return val
    except ValueError:
        id = convert_string_to_uuid(val)
        return id


def convert_string_to_uuid(val):
    hex_string = hashlib.md5(val.encode('UTF-8')).hexdigest()
    return uuid.UUID(hex=hex_string)


def convert_string_to_datetime(val):
    if val is None:
        return None
    return datetime.strptime(val, DATE_FORMAT)


async def insert_library_items(db_conn, library_items):
    insert_query = '''
        INSERT INTO omnivore.library_item (
            id, user_id, title, author, description, readable_content, original_url, upload_file_id, item_type, slug, reading_progress_top_percent, reading_progress_bottom_percent, reading_progress_highest_read_anchor, created_at, saved_at, archived_at, site_name, subscription, state, updated_at, published_at, item_language, read_at, word_count, site_icon, thumbnail, content_reader, original_content
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (user_id, original_url) DO UPDATE SET
            title = EXCLUDED.title,
            author = EXCLUDED.author,
            description = EXCLUDED.description,
            readable_content = EXCLUDED.readable_content,
            upload_file_id = EXCLUDED.upload_file_id,
            item_type = EXCLUDED.item_type,
            slug = EXCLUDED.slug,
            reading_progress_top_percent = EXCLUDED.reading_progress_top_percent,
            reading_progress_bottom_percent = EXCLUDED.reading_progress_bottom_percent,
            reading_progress_highest_read_anchor = EXCLUDED.reading_progress_highest_read_anchor,
            created_at = EXCLUDED.created_at,
            saved_at = EXCLUDED.saved_at,
            archived_at = EXCLUDED.archived_at,
            site_name = EXCLUDED.site_name,
            subscription = EXCLUDED.subscription,
            state = EXCLUDED.state,
            updated_at = EXCLUDED.updated_at,
            published_at = EXCLUDED.published_at,
            item_language = EXCLUDED.item_language,
            read_at = EXCLUDED.read_at,
            word_count = EXCLUDED.word_count,
            site_icon = EXCLUDED.site_icon,
            thumbnail = EXCLUDED.thumbnail,
            content_reader = EXCLUDED.content_reader,
            original_content = EXCLUDED.original_content
    '''
    print('Inserting library items into postgres')
    await insert_into_postgres(insert_query, db_conn, library_items)
    print(f'Inserted {len(library_items)} library items')


async def insert_highlights(db_conn, highlights):
    insert_query = '''
        INSERT INTO omnivore.highlight (
            id, user_id, quote, prefix, suffix, patch, annotation, created_at, updated_at, shared_at, short_id, library_item_id, highlight_position_percent, highlight_position_anchor_index, highlight_type, color, html
        )
        SELECT
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17
        FROM
            omnivore.library_item
        WHERE
            id = $12
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            quote = EXCLUDED.quote,
            prefix = EXCLUDED.prefix,
            suffix = EXCLUDED.suffix,
            patch = EXCLUDED.patch,
            annotation = EXCLUDED.annotation,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at,
            shared_at = EXCLUDED.shared_at,
            short_id = EXCLUDED.short_id,
            library_item_id = EXCLUDED.library_item_id,
            highlight_position_percent = EXCLUDED.highlight_position_percent,
            highlight_position_anchor_index = EXCLUDED.highlight_position_anchor_index,
            highlight_type = EXCLUDED.highlight_type,
            color = EXCLUDED.color,
            html = EXCLUDED.html
    '''
    print('Inserting highlights into postgres')
    await insert_into_postgres(insert_query, db_conn, highlights)
    print(f'Inserted {len(highlights)} highlights')


async def insert_labels(db_conn, labels):
    insert_query = '''
        INSERT INTO omnivore.entity_labels (
            label_id, library_item_id, highlight_id
        )
        SELECT $1, $2, $3
        FROM omnivore.labels l
        LEFT JOIN omnivore.library_item li ON li.id = $2
        LEFT JOIN omnivore.highlight h ON h.id = $3
        WHERE l.id = $1 AND ($2 IS NULL OR li.id = $2) AND ($3 IS NULL OR h.id = $3)
        ON CONFLICT (label_id, library_item_id, highlight_id) DO NOTHING
    '''
    print('Inserting labels into postgres')
    await insert_into_postgres(insert_query, db_conn, labels)
    print(f'Inserted {len(labels)} labels')


async def insert_recommendations(db_conn, recommendations):
    insert_query = '''
        INSERT INTO omnivore.recommendation (
            library_item_id, recommender_id, group_id, note, created_at
        )
        SELECT $1, $2, $3, $4, $5
        FROM omnivore.library_item li
        INNER JOIN omnivore.user u ON u.id = $2
        INNER JOIN omnivore.group g ON g.id = $3
        WHERE li.id = $1
        ON CONFLICT (library_item_id, recommender_id, group_id) DO UPDATE SET
            note = EXCLUDED.note,
            created_at = EXCLUDED.created_at
    '''
    print('Inserting recommendations into postgres')
    await insert_into_postgres(insert_query, db_conn, recommendations)
    print(f'Inserted {len(recommendations)} recommendations')


async def insert_into_postgres(insert_query, db_conn, records):
    await db_conn.executemany(insert_query, records, timeout=60)


def remove_null_bytes(val):
    if val is None:
        return None
    return val.replace('\u0000', '')


async def main():
    print('Starting migration')
    migrated_at = CUT_OFF_DATE
    print('Cut off date', CUT_OFF_DATE)

    # postgres connection
    db_conn = await asyncpg.connect(user=PG_USER, password=PG_PASSWORD,
                                    database=PG_DB, host=PG_HOST, port=PG_PORT)

    # elastic client
    es_client = AsyncElasticsearch(ES_URL, http_auth=(
        ES_USERNAME, ES_PASSWORD), retry_on_timeout=True)

    try:
        print(await es_client.info())

        print('Getting list of users from postgres')
        users = await db_conn.fetch('SELECT id FROM omnivore.user')

        print('Getting list of uploaded files from postgres')
        uploaded_files = await db_conn.fetch('SELECT id FROM omnivore.upload_files')

        print('Getting data from elastic and if uploadFileId exists, check if it exists in postgres')
        i = 0
        library_items = []
        highlights = []
        labels = []
        recommendations = []

        query = {
            'query': {
                'bool': {
                    'must': [
                        {
                            'range': {
                                'updatedAt': {
                                    'gte': CUT_OFF_DATE
                                }
                            }
                        },
                        {
                            'terms': {
                                'userId': [user['id'] for user in users]
                            },
                        },
                    ],
                    'should': [
                        {
                            'bool': {
                                'must_not': {
                                    'exists': {
                                        'field': 'uploadFileId'
                                    }
                                }
                            },
                        },
                        {
                            'terms': {
                                'uploadFileId': [file['id'] for file in uploaded_files]
                            }
                        }
                    ],
                    'minimum_should_match': 1,
                }
            },
            'sort': [
                {
                    'updatedAt': {
                        'order': 'asc'
                    }
                }
            ]
        }
        # get current time
        migrated_at = datetime.utcnow().strftime(DATE_FORMAT)
        # Scan API for larger library
        docs = async_scan(es_client, index=ES_INDEX, query=query,
                          preserve_order=True, size=ES_SCAN_SIZE,
                          request_timeout=60)

        # convert _id to uuid
        async for doc in docs:
            i += 1
            id = get_uuid(doc['_id'])

            # convert library items to postgres format
            source = doc['_source']
            subscription = source['subscription'] if 'subscription' in source else source.get('rssFeedUrl', None)
            page_type = source['pageType']
            content_reader = 'WEB'
            if 'uploadFileId' in source:
                if page_type == 'BOOK':
                    content_reader = 'EPUB'
                elif page_type == 'FILE':
                    content_reader = 'PDF'

            library_item = (
                id,
                get_uuid(source['userId']),
                source['title'],
                source.get('author', None),
                source.get('description', None),
                source['content'],
                source['url'],
                source.get('uploadFileId', None),
                page_type,
                source['slug'],
                source.get('readingProgressTopPercent', 0),
                source.get('readingProgressPercent', 0),
                source.get('readingProgressAnchorIndex', 0),
                convert_string_to_datetime(source['createdAt']),
                convert_string_to_datetime(source['savedAt']),
                convert_string_to_datetime(source.get('archivedAt', None)),
                source.get('siteName', None),
                subscription,
                source['state'],
                convert_string_to_datetime(source['updatedAt']),
                convert_string_to_datetime(source.get('publishedAt', None)),
                source.get('language', None),
                convert_string_to_datetime(source.get('readAt', None)),
                source.get('wordsCount', None),
                remove_null_bytes(source.get('siteIcon', None)),
                remove_null_bytes(source.get('image', None)),
                content_reader,
                remove_null_bytes(source.get('originalHtml', None)),
            )
            library_items.append(library_item)

            # convert labels to postgres format
            if 'labels' in source:
                for label in source['labels']:
                    labels.append((
                        get_uuid(label['id']),
                        id,
                        None,
                    ))

            # convert highlights to postgres format
            if 'highlights' in source:
                for highlight in source['highlights']:
                    highlight_id = get_uuid(highlight['id'])
                    highlights.append((
                        highlight_id,
                        get_uuid(highlight['userId']),
                        highlight.get('quote', None),
                        highlight.get('prefix', None),
                        highlight.get('suffix', None),
                        highlight.get('patch', None),
                        highlight.get('annotation', None),
                        convert_string_to_datetime(highlight['createdAt']),
                        convert_string_to_datetime(highlight.get('updatedAt', None)),
                        convert_string_to_datetime(highlight.get('sharedAt', None)),
                        highlight.get('shortId', None),
                        id,
                        highlight.get('highlightPositionPercent', 0),
                        highlight.get('highlightPositionAnchorIndex', 0),
                        highlight.get('type', 'HIGHLIGHT'),
                        highlight.get('color', None),
                        highlight.get('html', None),
                    ))

                    if 'labels' in highlight:
                        for label in highlight['labels']:
                            labels.append((
                                get_uuid(label['id']),
                                None,
                                highlight_id,
                            ))

            # convert recommendations to postgres format
            if 'recommendations' in source:
                for recommendation in source['recommendations']:
                    recommendations.append((
                        id,
                        get_uuid(recommendation['user']['userId']),
                        get_uuid(recommendation['id']),
                        recommendation.get('note', None),
                        convert_string_to_datetime(recommendation['recommendedAt']),
                    ))

            # copy to postgres every ES_SCAN_SIZE records
            if i % ES_SCAN_SIZE == 0:
                await insert_library_items(db_conn, library_items)
                print('Copied', i, 'records to postgres')
                library_items = []
                if len(highlights) > 0:
                    await insert_highlights(db_conn, highlights)
                    highlights = []
                if len(labels) > 0:
                    await insert_labels(db_conn, labels)
                    labels = []
                if len(recommendations) > 0:
                    await insert_recommendations(db_conn, recommendations)
                    recommendations = []
        # copy remaining records to postgres
        if len(library_items) > 0:
            await insert_library_items(db_conn, library_items)
            print('Copied', i, 'records to postgres')
        if len(highlights) > 0:
            await insert_highlights(db_conn, highlights)
        if len(labels) > 0:
            await insert_labels(db_conn, labels)
        if len(recommendations) > 0:
            await insert_recommendations(db_conn, recommendations)

        print('Migration complete', migrated_at)

        await assert_data(db_conn, es_client, users, uploaded_files)
    except Exception as err:
        print('Migration error', err)
    finally:
        print('Closing connections')
        await db_conn.close()
        await es_client.close()

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
