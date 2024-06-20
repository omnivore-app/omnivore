# download raw user data, aggregate user history, and upload to GCS

import psycopg2
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

import os
from io import BytesIO
import tempfile

import pickle
import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.feather as feather
from google.cloud import storage

FEATURE_COLUMNS=[
  # targets 
  # 'user_clicked', 'user_read', 'user_long_read',

  # item attributes / user setup attributes
  'item_word_count','item_has_site_icon', 'is_subscription',
  'inbox_folder', 'has_author',

  # how the user has setup the subscription
  'is_newsletter', 'is_feed', 'days_since_subscribed',
  'subscription_count', 'subscription_auto_add_to_library', 
  'subscription_fetch_content',

  # user/item interaction history
  'user_original_url_host_saved_count_week_1',
  'user_original_url_host_interaction_count_week_1',
  'user_original_url_host_rate_week_1',
  'user_original_url_host_proportion_week_1',

  'user_original_url_host_saved_count_week_2',
  'user_original_url_host_interaction_count_week_2',
  'user_original_url_host_rate_week_2',
  'user_original_url_host_proportion_week_2',
  'user_original_url_host_saved_count_week_3',
  'user_original_url_host_interaction_count_week_3',
  'user_original_url_host_rate_week_3',
  'user_original_url_host_proportion_week_3',
  'user_original_url_host_saved_count_week_4',
  'user_original_url_host_interaction_count_week_4',
  'user_original_url_host_rate_week_4',
  'user_original_url_host_proportion_week_4',

  'user_subscription_saved_count_week_1',
  'user_subscription_interaction_count_week_1',
  'user_subscription_rate_week_1', 'user_subscription_proportion_week_1',
  'user_site_saved_count_week_3', 'user_site_interaction_count_week_3',
  'user_site_rate_week_3', 'user_site_proportion_week_3',
  'user_site_saved_count_week_2', 'user_site_interaction_count_week_2',
  'user_site_rate_week_2', 'user_site_proportion_week_2',
  'user_subscription_saved_count_week_2',
  'user_subscription_interaction_count_week_2',
  'user_subscription_rate_week_2', 'user_subscription_proportion_week_2',
  'user_site_saved_count_week_1', 'user_site_interaction_count_week_1',
  'user_site_rate_week_1', 'user_site_proportion_week_1',
  'user_subscription_saved_count_week_3',
  'user_subscription_interaction_count_week_3',
  'user_subscription_rate_week_3', 'user_subscription_proportion_week_3',
  'user_author_saved_count_week_4',
  'user_author_interaction_count_week_4', 'user_author_rate_week_4',
  'user_author_proportion_week_4', 'user_author_saved_count_week_1',
  'user_author_interaction_count_week_1', 'user_author_rate_week_1',
  'user_author_proportion_week_1', 'user_site_saved_count_week_4',
  'user_site_interaction_count_week_4', 'user_site_rate_week_4',
  'user_site_proportion_week_4', 'user_author_saved_count_week_2',
  'user_author_interaction_count_week_2', 'user_author_rate_week_2',
  'user_author_proportion_week_2', 'user_author_saved_count_week_3',
  'user_author_interaction_count_week_3', 'user_author_rate_week_3',
  'user_author_proportion_week_3', 'user_subscription_saved_count_week_4',
  'user_subscription_interaction_count_week_4',
  'user_subscription_rate_week_4', 'user_subscription_proportion_week_4'
]

def parquet_to_dataframe(file_path):
    table = pq.read_table(file_path)
    df = table.to_pandas()
    return df


def load_tables_from_pickle(pickle_file):
  with open(pickle_file, 'rb') as handle:
    tables = pickle.load(handle)
  return tables


def download_raw_library_items(execution_date, gcs_bucket_name):
  local_file_path = 'raw_library_items.parquet'

  client = storage.Client()
  bucket = client.bucket(gcs_bucket_name)
  blob = bucket.blob(f'data/raw/library_items_{execution_date}.parquet')
  blob.download_to_filename(local_file_path)

  df = parquet_to_dataframe(local_file_path)

  os.remove(local_file_path)
  return df


def load_feather_files(feature_directory):
    dataframes = {}
    for file_name in os.listdir(feature_directory):
        if file_name.endswith('.feather'):
            file_path = os.path.join(feature_directory, file_name)
            df_name = os.path.splitext(file_name)[0]  # Use the file name (without extension) as key
            table = feather.read_table(file_path)
            dataframes[df_name] = table
    return dataframes


def save_tables_to_arrow_ipc_with_schemas(tables, output_file):
    with pa.OSFile(output_file, 'wb') as sink:
        with pa.ipc.new_stream(sink, pa.schema([])) as writer:
            for name, table in tables.items():
                metadata = table.schema.metadata or {}
                metadata = {**metadata, b'table_name': name.encode('utf-8')}
                schema = table.schema.add_metadata(metadata)
                print("NAME:", name, "TABLE", table)
                writer.write_table(table.replace_schema_metadata(schema.metadata))


def save_tables_to_pickle(tables, output_file):
  with open(output_file, 'wb') as handle:
    pickle.dump(tables, handle, protocol=pickle.HIGHEST_PROTOCOL)


def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
  client = storage.Client()
  bucket = client.bucket(bucket_name)
  blob = bucket.blob(destination_blob_name)
  blob.upload_from_filename(source_file_name)
  print(f'File {source_file_name} uploaded to {destination_blob_name} in bucket {bucket_name}.')


def generate_and_upload_user_history(execution_date, gcs_bucket_name):
  df = download_raw_library_items(execution_date, gcs_bucket_name)
  with tempfile.TemporaryDirectory() as tmpdir:
    user_preferences = aggregate_user_preferences(df, tmpdir)
    dataframes = load_feather_files(tmpdir)
    filename = os.path.join(tmpdir, 'user_features.pkl')
    save_tables_to_pickle(dataframes, filename)
    files = load_tables_from_pickle(filename)
    print("GENERATED FEATURE TABLES:", files.keys())
    for table in files.keys():
      print("TABLE: ", table, "LEN: ", len(files[table]))
    upload_to_gcs(gcs_bucket_name, filename, f'data/features/user_features.pkl')



def compute_dimension_aggregates(df, dimension, bucket_name):
  # Compute initial aggregates to filter out items with less than 2 saved counts
  initial_agg = df.groupby(['user_id', dimension]).size().reset_index(name='count')
  filtered_df = df[df.set_index(['user_id', dimension]).index.isin(initial_agg[initial_agg['count'] >= 2].set_index(['user_id', dimension]).index)]

  agg = filtered_df.groupby(['user_id', dimension]).agg(
      saved_count=(dimension, 'count'),
      interaction_count=('user_clicked', 'sum')
  ).reset_index()

  agg[f'user_{dimension}_rate_{bucket_name}'] = agg['interaction_count'] / agg['saved_count']
  agg[f'user_{dimension}_proportion_{bucket_name}'] = agg.groupby('user_id')['interaction_count'].transform(lambda x: x / x.sum())

  agg = agg.rename(columns={
      'saved_count': f'user_{dimension}_saved_count_{bucket_name}',
      'interaction_count': f'user_{dimension}_interaction_count_{bucket_name}'
  })

  return agg

def calculate_and_save_aggregates(bucket_name, bucket_df, output_dir):
  # Compute aggregates for each dimension
  dimensions = ['author', 'site', 'original_url_host', 'subscription']
  for dimension in dimensions:
    agg_df = compute_dimension_aggregates(bucket_df, dimension, bucket_name)
    
    # Save the aggregated DataFrame to a Feather file
    filename = os.path.join(output_dir, f'user_{dimension}_{bucket_name}.feather')
    save_aggregated_data(agg_df, filename)
    print(f"Saved aggregated data for {dimension} in {bucket_name} to {filename}")


def save_aggregated_data(df, filename):
    buffer = BytesIO()
    df.to_feather(buffer)
    buffer.seek(0)

    with open(filename, 'wb') as f:
        f.write(buffer.getbuffer())


def aggregate_user_preferences(df, output_dir):
  # Convert 'created_at' to datetime
  df['created_at'] = pd.to_datetime(df['created_at'])

  end_date = df['created_at'].max()
  
  # Define bucket ranges for the past four weeks
  buckets = {
    'week_4': (end_date - timedelta(weeks=4), end_date - timedelta(weeks=3)),
    'week_3': (end_date - timedelta(weeks=3), end_date - timedelta(weeks=2)),
    'week_2': (end_date - timedelta(weeks=2), end_date - timedelta(weeks=1)),
    'week_1': (end_date - timedelta(weeks=1), end_date)
  }
  
  # Calculate aggregates for each bucket and save to file
  for bucket_name, (start_date, end_date) in buckets.items():
    bucket_df = df[(df['created_at'] >= start_date) & (df['created_at'] < end_date)]
    calculate_and_save_aggregates(bucket_name, bucket_df, output_dir)



def create_and_upload_user_history(execution_date, num_days_history, gcs_bucket_name):
  buffer = download_raw_library_items(execution_date, gcs_bucket_name)
  buffer = open_raw_library_items()
  upload_raw_databuffer(buffer, execution_date, gcs_bucket_name)