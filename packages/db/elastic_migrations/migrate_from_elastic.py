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
PG_COOLDOWN_TIME = os.getenv('PG_COOLDOWN_TIME', 1)
PG_TIMEOUT = os.getenv('PG_TIMEOUT', 60)
ES_URL = os.getenv('ES_URL', 'http://localhost:9200')
ES_USERNAME = os.getenv('ES_USERNAME', 'elastic')
ES_PASSWORD = os.getenv('ES_PASSWORD', 'password')
ES_SCAN_SIZE = os.getenv('ES_SCAN_SIZE', 1000)
ES_SCROLL_TIME = os.getenv('ES_SCROLL_TIME', '2m')
ES_INDEX = os.getenv('ES_INDEX', 'pages_alias')
ES_TIMEOUT = os.getenv('ES_TIMEOUT', 60)

START_TIME = os.getenv('START_TIME', '2000-01-01')
END_TIME = os.getenv('END_TIME', '2100-01-01')
# ISO 8601 format
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S.%fZ'


async def assert_data(db_conn, es_client, user_ids, uploaded_files):
    # get all users from postgres
    try:
        success = 0
        failure = 0
        for user_id in user_ids:
            number_of_docs_in_postgres = await db_conn.fetchval(
                f'SELECT COUNT(1) FROM omnivore.library_item WHERE user_id = \'{user_id}\'')

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
        return uuid.UUID(val)
    except ValueError:
        id = convert_string_to_uuid(val)
        return id


def convert_string_to_uuid(val):
    hex_string = hashlib.md5(val.encode('UTF-8')).hexdigest()
    return uuid.UUID(hex=hex_string)


def convert_string_to_datetime(val):
    if val is None:
        return None
    try:
        date = datetime.strptime(val, DATE_FORMAT)
        if date.year <= 1:
            # avoid year 0 is out of range error
            return None
        return date
    except Exception as err:
        print('Convert string to datetime ERROR:', err)
        return None


async def insert_library_items(db_conn, library_items, original_ids):
    insert_query = '''
        INSERT INTO omnivore.library_item (
            id, user_id, title, author, description, readable_content, original_url, upload_file_id, item_type, slug, reading_progress_top_percent, reading_progress_bottom_percent, reading_progress_highest_read_anchor, created_at, saved_at, archived_at, site_name, subscription, state, updated_at, published_at, item_language, read_at, word_count, site_icon, thumbnail, content_reader, original_content, deleted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        ON CONFLICT (user_id, md5(original_url)) DO UPDATE SET
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
            original_content = EXCLUDED.original_content,
            deleted_at = EXCLUDED.deleted_at
    '''
    print(f'Inserting {len(library_items)} library items into postgres')
    await insert_into_postgres(insert_query, db_conn, library_items, original_ids)
    print(f'Inserted {len(library_items)} library items')


async def insert_highlights(db_conn, highlights, original_ids):
    insert_query = '''
        INSERT INTO omnivore.highlight (
            id, user_id, quote, prefix, suffix, patch, annotation, created_at, updated_at, shared_at, short_id, library_item_id, highlight_position_percent, highlight_position_anchor_index, highlight_type, color, html
        )
        SELECT
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17
        FROM
            omnivore.library_item l
        INNER JOIN omnivore.user u ON u.id = $2
        WHERE
            l.id = $12
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
    print(f'Inserting {len(highlights)} highlights into postgres')
    await insert_into_postgres(insert_query, db_conn, highlights, original_ids)
    print(f'Inserted {len(highlights)} highlights')


async def insert_labels(db_conn, labels, original_ids):
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
    print(f'Inserting {len(labels)} labels into postgres')
    await insert_into_postgres(insert_query, db_conn, labels, original_ids)
    print(f'Inserted {len(labels)} labels')


async def insert_recommendations(db_conn, recommendations, original_ids):
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
    print(f'Inserting {len(recommendations)} recommendations into postgres')
    await insert_into_postgres(insert_query, db_conn, recommendations, original_ids)
    print(f'Inserted {len(recommendations)} recommendations')


async def insert_into_postgres(insert_query, db_conn, records, original_ids):
    sanitized_records = sanitize_tuples(records)

    try:
        await db_conn.executemany(insert_query, sanitized_records, timeout=int(PG_TIMEOUT))
    except Exception as err:
        print('Batch insert into postgres ERROR:', err)
        # excute insert query one by one if batch insert failed
        for i, record in enumerate(sanitized_records):
            # print original id for debugging
            print('Inserting record', original_ids[i])
            try:
                await db_conn.execute(insert_query, *record, timeout=int(PG_TIMEOUT))
            except Exception as err:
                # print the error
                print('Insert into postgres ERROR:', err)
                if 'string is too long for tsvector' in str(err):
                    # create a transaction
                    async with db_conn.transaction():
                        # disable library_item_tsv_update trigger
                        await db_conn.execute('ALTER TABLE omnivore.library_item DISABLE TRIGGER library_item_tsv_update')
                        # insert record again
                        await db_conn.execute(insert_query, *record, timeout=int(PG_TIMEOUT))
                        # enable library_item_tsv_update trigger
                        await db_conn.execute('ALTER TABLE omnivore.library_item ENABLE TRIGGER library_item_tsv_update')
                elif 'duplicate key value violates unique constraint' in str(err):
                    # skip the error
                    print('Skipping duplicate record', original_ids[i])
                    continue
                else:
                    # throw the error
                    raise err

    # cool down for PG_COOLDOWN_TIME seconds
    if float(PG_COOLDOWN_TIME) > 0:
        await asyncio.sleep(float(PG_COOLDOWN_TIME))


def sanitize_tuples(tuples):
    sanitize_tuples = []
    for tuple in tuples:
        sanitize_tuple = []
        for val in tuple:
            sanitize_tuple.append(sanitize_string(val))
        sanitize_tuples.append(sanitize_tuple)
    return sanitize_tuples


def sanitize_string(val):
    # sanitize valu if val is a string
    if isinstance(val, str):
        return replace_surrogates(remove_null_bytes(val))
    return val


def remove_null_bytes(val):
    if val is None:
        return None
    return val.replace('\u0000', '')


def replace_surrogates(val):
    if val is None:
        return None
    return val.encode('utf-8', 'replace').decode('utf-8')


async def main():
    print('Starting migration', START_TIME, END_TIME)

    # postgres connection
    db_conn = await asyncpg.connect(user=PG_USER, password=PG_PASSWORD,
                                    database=PG_DB, host=PG_HOST, port=PG_PORT,
                                    timeout=int(PG_TIMEOUT))

    # elastic client
    es_client = AsyncElasticsearch(ES_URL, http_auth=(
        ES_USERNAME, ES_PASSWORD), retry_on_timeout=True)

    try:
        # updated_user_ids = []

        print(await es_client.info())

        # disable update_library_item_modtime trigger
        await db_conn.execute('ALTER TABLE omnivore.library_item DISABLE TRIGGER update_library_item_modtime')

        print('Getting list of users from postgres')
        users = await db_conn.fetch('SELECT id FROM omnivore.user')

        print('Getting list of uploaded files from postgres')
        uploaded_files = await db_conn.fetch('SELECT id FROM omnivore.upload_files')

        print('Getting data from elastic and if uploadFileId exists, check if it exists in postgres')
        i = 0
        library_items = []
        library_items_original_ids = []
        highlights = []
        highlights_original_ids = []
        labels = []
        labels_original_ids = []
        recommendations = []
        recommendations_original_ids = []

        query = {
            'query': {
                'bool': {
                    'must': [
                        {
                            'range': {
                                'updatedAt': {
                                    'gte': START_TIME,
                                    'lte': END_TIME,
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
        # Scan API for larger library
        docs = async_scan(es_client, index=ES_INDEX, query=query,
                          preserve_order=True, size=ES_SCAN_SIZE,
                          request_timeout=int(ES_TIMEOUT), scroll=ES_SCROLL_TIME)

        # convert _id to uuid
        async for doc in docs:
            i += 1
            doc_id = doc['_id']
            id = get_uuid(doc_id)

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
            updated_at = convert_string_to_datetime(source['updatedAt'])
            state = source['state']
            deleted_at = updated_at if state == 'DELETED' else None
            reading_progress_top_percent = source.get('readingProgressTopPercent', 0)
            reading_progress_percent = source.get('readingProgressPercent', 0)
            reading_progress_anchor = source.get('readingProgressAnchorIndex', 0)
            content = source['content']
            original_html = source.get('originalHtml', None)
            description = source.get('description', None)
            user_id = get_uuid(source['userId'])

            # skip item if content is larger than 1MB
            if len(content) > 1048575:
                print('Skipping item', doc_id, 'because content is larger than 1MB')
                continue

            library_item = (
                id,
                user_id,
                source['title'],
                source.get('author', None),
                description,
                content,
                source['url'],
                source.get('uploadFileId', None),
                page_type if page_type is not None else 'UNKNOWN',
                source['slug'],
                reading_progress_top_percent if reading_progress_top_percent is not None else 0,
                reading_progress_percent if reading_progress_percent is not None else 0,
                reading_progress_anchor if reading_progress_anchor is not None else 0,
                convert_string_to_datetime(source['createdAt']),
                convert_string_to_datetime(source['savedAt']),
                convert_string_to_datetime(source.get('archivedAt', None)),
                source.get('siteName', None),
                subscription,
                state,
                updated_at,
                convert_string_to_datetime(source.get('publishedAt', None)),
                source.get('language', None),
                convert_string_to_datetime(source.get('readAt', None)),
                source.get('wordsCount', None),
                source.get('siteIcon', None),
                source.get('image', None),
                content_reader,
                original_html,
                deleted_at,
            )

            library_items.append(library_item)
            library_items_original_ids.append(doc_id)

            # if user_id not in updated_user_ids:
            #     updated_user_ids.append(user_id)

            # convert labels to postgres format
            if 'labels' in source:
                for label in source['labels']:
                    labels.append((
                        get_uuid(label['id']),
                        id,
                        None,
                    ))
                    labels_original_ids.append(label['id'])

            # convert highlights to postgres format
            if 'highlights' in source:
                for highlight in source['highlights']:
                    highlight_id = get_uuid(highlight['id'])
                    short_id = highlight.get('shortId', None)
                    if len(short_id) > 14:
                        short_id = short_id[:14]
                    highlight_position_percent = highlight.get('highlightPositionPercent', 0)
                    highlight_position_anchor_index = highlight.get('highlightPositionAnchorIndex', 0)

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
                        short_id,
                        id,
                        highlight_position_percent if highlight_position_percent is not None else 0,
                        highlight_position_anchor_index if highlight_position_anchor_index is not None else 0,
                        highlight.get('type', 'HIGHLIGHT'),
                        highlight.get('color', None),
                        highlight.get('html', None),
                    ))
                    highlights_original_ids.append(highlight['id'])

                    if 'labels' in highlight:
                        for label in highlight['labels']:
                            labels.append((
                                get_uuid(label['id']),
                                None,
                                highlight_id,
                            ))
                            labels_original_ids.append(label['id'])

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
                    recommendations_original_ids.append(recommendation['id'])

            # copy to postgres every ES_SCAN_SIZE records
            if i % int(ES_SCAN_SIZE) == 0:
                await insert_library_items(db_conn, library_items, library_items_original_ids)
                print('Copied', i, 'records to postgres')
                library_items = []
                library_items_original_ids = []
                if len(highlights) > 0:
                    await insert_highlights(db_conn, highlights, highlights_original_ids)
                    highlights = []
                    highlights_original_ids = []
                if len(labels) > 0:
                    await insert_labels(db_conn, labels, labels_original_ids)
                    labels = []
                    labels_original_ids = []
                if len(recommendations) > 0:
                    await insert_recommendations(db_conn, recommendations, recommendations_original_ids)
                    recommendations = []
                    recommendations_original_ids = []

        # copy remaining records to postgres
        if len(library_items) > 0:
            await insert_library_items(db_conn, library_items, library_items_original_ids)
            print('Copied', i, 'records to postgres')
        if len(highlights) > 0:
            await insert_highlights(db_conn, highlights, highlights_original_ids)
        if len(labels) > 0:
            await insert_labels(db_conn, labels, labels_original_ids)
        if len(recommendations) > 0:
            await insert_recommendations(db_conn, recommendations, recommendations_original_ids)

        print('Migration complete', END_TIME)

        # await assert_data(db_conn, es_client, updated_user_ids, uploaded_files)
    except Exception as err:
        print('Migration error', err)
    finally:
        print('Closing connections')
        # enable update_library_item_modtime trigger
        await db_conn.execute('ALTER TABLE omnivore.library_item ENABLE TRIGGER update_library_item_modtime')
        await db_conn.close()
        await es_client.close()

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
