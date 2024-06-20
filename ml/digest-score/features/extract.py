# extract and upload raw data used for feature generation

import psycopg2
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

import os
from io import BytesIO
import tempfile

import pyarrow as pa
import pyarrow.parquet as pq
from google.cloud import storage

DB_PARAMS = {
  'dbname': os.getenv('DB_NAME') or 'omnivore',
  'user': os.getenv('DB_USER'),
  'password': os.getenv('DB_PASSWORD'),
  'host': os.getenv('DB_HOST') or 'localhost',
  'port': os.getenv('DB_PORT') or '5432'
}

def extract_host(url):
  try:
    return urlparse(url).netloc
  except Exception as e:
    return None

def fetch_raw_data(date_str, num_days_history):
  end_date = pd.to_datetime(date_str)
  start_date = end_date - timedelta(days=num_days_history)
  start_date_str = start_date.strftime('%Y-%m-%d 00:00:00')
  end_date_str = end_date.strftime('%Y-%m-%d 23:59:59')

  conn_str = f"postgresql://{DB_PARAMS['user']}:{DB_PARAMS['password']}@{DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}"
  # conn_str = f"postgresql://{DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}"
  engine = create_engine(conn_str)

  query = text("""
  SELECT
    li.id as library_item_id,
    li.user_id,
    li.created_at,
    li.archived_at,
    li.deleted_at,
    CASE WHEN li.folder = 'inbox' then 1 else 0 END as inbox_folder,
    li.item_type,
    li.item_language AS language,
    li.content_reader,
    li.word_count as item_word_count,
    CASE WHEN li.thumbnail IS NOT NULL then 1 else 0 END as item_has_thumbnail,
    CASE WHEN li.site_icon IS NOT NULL then 1 else 0 END as item_has_site_icon,
    li.original_url,
    li.site_name AS site,
    li.author,
    li.subscription,
    sub.type as subscription_type,
    sub.created_at as subscription_start_date,
    sub.count as subscription_count,
    sub.auto_add_to_library as subscription_auto_add_to_library,
    sub.fetch_content as subscription_fetch_content,
    sub.folder as subscription_folder,
    CASE WHEN li.read_at is not NULL then 1 else 0 END as user_clicked,
    CASE WHEN li.reading_progress_bottom_percent > 10 THEN 1 ELSE 0 END AS user_read,
    CASE WHEN li.reading_progress_bottom_percent > 50 THEN 1 ELSE 0 END AS user_long_read
  FROM omnivore.library_item AS li
  LEFT JOIN omnivore.subscriptions sub on li.subscription = sub.name AND sub.user_id = li.user_id
  WHERE li.created_at >= :start_date AND li.created_at <= :end_date;
  """)

  chunk_size = 100000  # Adjust based on available memory and performance needs

  with tempfile.TemporaryDirectory() as tmpdir:
    parquet_files = []
    with engine.connect() as conn:
      for i, chunk in enumerate(pd.read_sql(query, conn, params={'start_date': start_date_str, 'end_date': end_date_str}, chunksize=chunk_size)):
          chunk['library_item_id'] = chunk['library_item_id'].astype(str)
          chunk['user_id'] = chunk['user_id'].astype(str)
          chunk['original_url_host'] = chunk['original_url'].apply(extract_host)

          parquet_file = os.path.join(tmpdir, f'chunk_{i}.parquet')
          chunk.to_parquet(parquet_file)
          parquet_files.append(parquet_file)

    concatenated_df = pd.concat([pd.read_parquet(file) for file in parquet_files], ignore_index=True)

    parquet_buffer = BytesIO()
    table = pa.Table.from_pandas(concatenated_df)
    pq.write_table(table, parquet_buffer)
    parquet_buffer.seek(0)

  return parquet_buffer


def upload_raw_databuffer(feather_buffer, execution_date, gcs_bucket_name):
  client = storage.Client()
  bucket = client.bucket(gcs_bucket_name)
  blob = bucket.blob(f'data/raw/library_items_{execution_date}.parquet')
  blob.upload_from_file(feather_buffer, content_type='application/octet-stream')

  print("Data stored successfully.")


def extract_and_upload_raw_data(execution_date, num_days_history, gcs_bucket_name):
  buffer = fetch_raw_data(execution_date, int(num_days_history))
  upload_raw_databuffer(buffer, execution_date, gcs_bucket_name)

