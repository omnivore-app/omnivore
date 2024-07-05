import logging
from flask import Flask, request, jsonify
from prometheus_client import start_http_server, Histogram, Summary, Counter, generate_latest

from typing import List
from timeit import default_timer as timer

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
import joblib
from urllib.parse import urlparse
from datetime import datetime
import dateutil.parser
from google.cloud import storage

import concurrent.futures
from threading import Lock, RLock
from collections import ChainMap
import copy

from features.user_history import FEATURE_COLUMNS
from auth import user_token_required, admin_token_required


class ThreadSafeUserFeatures:
  def __init__(self):
    self._data = {}
    self._lock = RLock()

  def get(self):
    with self._lock:
      return dict(self._data)

  def update(self, new_features):
    with self._lock:
      self._data.update(new_features)


app = Flask(__name__)
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

USER_HISTORY_PATH = 'user_features.pkl'
MODEL_PIPELINE_PATH = 'predict_read_model-v003.pkl'

pipeline = None
user_features_store = ThreadSafeUserFeatures()


# these buckets are used for reporting scores, we want to make sure
# there is decent diversity in the returned scores.
score_bucket_ranges = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
score_buckets = {
    f'score_bucket_{int(b * 10)}': Counter(f'inference_score_bucket_{int(b * 10)}', f'Number of scores in the range {b - 0.1:.1f} to {b:.1f}')
    for b in score_bucket_ranges
}

def observe_score(score):
  for b in score_bucket_ranges:
    if b - 0.1 < score <= b:
      score_buckets[f'score_bucket_{int(b * 10)}'].inc()
      break

def download_from_gcs(bucket_name, gcs_path, destination_path):
  storage_client = storage.Client()
  bucket = storage_client.bucket(bucket_name)
  blob = bucket.blob(gcs_path)
  blob.download_to_filename(destination_path)


def load_pipeline(path):
  pipeline = joblib.load(path)
  return pipeline


def load_tables_from_pickle(path):
  with open(path, 'rb') as handle:
    tables = pickle.load(handle)
  return tables


def load_user_features(path):
  result = {}
  tables = load_tables_from_pickle(path)
  for table_name in tables.keys():
    result[table_name] = tables[table_name].to_pandas()
  return result


def dataframe_to_dict(df):
  result = {}
  for index, row in df.iterrows():
    user_id = row['user_id']
    if user_id not in result:
      result[user_id] = []
    result[user_id].append(row.to_dict())
  return result


def merge_dicts(dict1, dict2):
  for key, value in dict2.items():
    if key in dict1:
      dict1[key].extend(value)
    else:
      dict1[key] = value
  return dict1

def predict_proba_wrapper(X):
  return pipeline.predict_proba(X)


def refresh_data():
  start = timer()
  global pipeline
  if os.getenv('LOAD_LOCAL_MODEL') == None:
    app.logger.info(f"loading data from {os.getenv('GCS_BUCKET')}")
    gcs_bucket_name = os.getenv('GCS_BUCKET')
    download_from_gcs(gcs_bucket_name, f'data/features/{USER_HISTORY_PATH}', USER_HISTORY_PATH)
    download_from_gcs(gcs_bucket_name, f'data/models/{MODEL_PIPELINE_PATH}', MODEL_PIPELINE_PATH)
  pipeline = load_pipeline(MODEL_PIPELINE_PATH)

  new_features = load_user_features(USER_HISTORY_PATH)
  user_features_store.update(new_features)

  app.logger.info(f'time to refresh data (in seconds): {timer() - start}')
  app.logger.info(f'loaded pipeline: {pipeline}')
  app.logger.info(f'loaded number of user_features: {len(new_features)}')


def compute_score(user_id, item_features, user_features):
  interaction_score = compute_interaction_score(user_id, item_features, user_features)
  observe_score(interaction_score)
  return {
    'score': interaction_score,
    'interaction_score': interaction_score,
  }


def compute_interaction_score(user_id, item_features, user_features):
  start = timer()
  original_url_host = urlparse(item_features.get('original_url')).netloc
  df_test = pd.DataFrame([{
    'user_id': user_id,
    'author': item_features.get('author'),
    'site': item_features.get('site'),
    'subscription': item_features.get('subscription'),
    'original_url_host': original_url_host,

    'item_has_thumbnail': 1 if item_features.get('has_thumbnail') else 0,
    "item_has_site_icon": 1 if item_features.get('has_site_icon') else 0,

    'item_word_count': item_features.get('words_count'),
    'is_subscription': 1 if item_features.get('is_subscription') else 0,
    'is_newsletter': 1 if item_features.get('is_newsletter') else 0,
    'is_feed': 1 if item_features.get('is_feed') else 0,
    'days_since_subscribed': item_features.get('days_since_subscribed'),
    'subscription_count': item_features.get('subscription_count'),
    'subscription_auto_add_to_library': item_features.get('subscription_auto_add_to_library'),
    'subscription_fetch_content': item_features.get('subscription_fetch_content'),

    'has_author': 1 if item_features.get('author') else 0,
    'inbox_folder': 1 if item_features.get('folder') == 'inbox' else 0,
  }])

  for name, df in user_features.items():
    df = df[df['user_id'] == user_id]
    if 'author' in name:
      merge_keys = ['user_id', 'author']
    elif 'site' in name:
      merge_keys = ['user_id', 'site']
    elif 'subscription' in name:
      merge_keys = ['user_id', 'subscription']
    elif 'original_url_host' in name:
      merge_keys = ['user_id', 'original_url_host']
    else:
      print("skipping feature: ", name)
      continue
    df_test = pd.merge(df_test, df, on=merge_keys, how='left')
  df_test = df_test.fillna(0)
  df_predict = df_test[FEATURE_COLUMNS]

  infer_start = timer()
  interaction_score = pipeline.predict_proba(df_predict)
  app.logger.info(f'time to call infer (in seconds): {timer() - infer_start}')

  app.logger.info(f'INTERACTION SCORE: {interaction_score}')
  app.logger.info(f'item_features:\n{df_predict[df_predict != 0].stack()}')
  app.logger.info(f'time to compute score (in seconds): {timer() - start}')

  return np.float64(interaction_score[0][1])


def process_parallel_item(user_id, key, item, user_features):
  library_item_id = item['library_item_id']
  return library_item_id, compute_score(user_id, item, user_features)

def parallel_compute_scores(user_id, items, max_workers=None):
  user_features = user_features_store.get()
  result = {}
  with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
    future_to_item = {executor.submit(process_parallel_item, user_id, key, item, user_features): (key, item) 
                      for key, item in items.items()}
    
  for future in concurrent.futures.as_completed(future_to_item):
    key, item = future_to_item[future]
    try:
      library_item_id, score = future.result()
      result[library_item_id] = score
    except Exception as exc:
      app.logger.error(f'Item {key} generated an exception: {exc}')
  return result



@app.route('/_ah/health', methods=['GET'])
def ready():
  return jsonify({'OK': 'yes'}), 200

@app.route('/metrics')
def metrics():
  return generate_latest(), 200, {'Content-Type': 'text/plain; charset=utf-8'}


@app.route('/refresh', methods=['GET'])
@admin_token_required
def refresh():
  refresh_data()
  return jsonify({'OK': 'yes'}), 200


@app.route('/users/<user_id>/features', methods=['GET'])
@admin_token_required
def get_user_features(user_id):
  result = {}
  df_user = pd.DataFrame([{
    'user_id': user_id,
  }])

  user_features = user_features_store.get()

  user_data = {}
  for name, df in user_features.items():
    df = df[df['user_id'] == user_id]
    df_dict = dataframe_to_dict(df)
    user_data = merge_dicts(user_data, df_dict)

  return jsonify(user_data), 200


@app.route('/predict', methods=['POST'])
@user_token_required
def predict():
  try:
    data = request.get_json()
    app.logger.info(f"predict scoring request: {data}")

    user_id = request.user_id
    item_features = data.get('item_features')

    if user_id is None:
        return jsonify({'error': 'Missing user_id'}), 400

    user_features = user_features_store.get()
    score = compute_score(user_id, item_features, user_features)
    return jsonify({'score': score})
  except Exception as e:
    app.logger.error(f"exception in predict endpoint: {request.get_json()}\n{e}")
    return jsonify({'error': str(e)}), 500


@app.route('/batch', methods=['POST'])
@user_token_required
def batch():
  start = timer()
  try:
    data = request.get_json()
    items = data.get('items')
    user_id = request.user_id
    if user_id == None:
      return jsonify({'error': 'no user_id supplied'}), 400
    if len(items) > 101:
      return jsonify({'error': f'too many items: {len(items)}'}), 400
    result = parallel_compute_scores(user_id, items)

    app.logger.info(f'time to compute batch of {len(items)} items (in seconds): {timer() - start}')
    return jsonify(result)
  except Exception as e:
    app.logger.error(f"exception in batch endpoint: {request.get_json()}\n{e}")
    return jsonify({'error': str(e)}), 500

## Run this on startup in both production and development modes
refresh_data()

if __name__ == '__main__':
  app.run(debug=True, port=5000)