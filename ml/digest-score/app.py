import psycopg2

import logging
from flask import Flask, request, jsonify
from pydantic import BaseModel, ConfigDict, ValidationError, conlist

from typing import List

import os
import sys
import json
import pytz
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timedelta
from datetime import datetime
import dateutil.parser
from google.cloud import storage

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, stream=sys.stdout)


TRAIN_FEATURES = [
  "item_has_thumbnail",
  "item_has_site_icon",

  'user_30d_interactions_author_count',
  'user_30d_interactions_site_count',
  'user_30d_interactions_subscription_count',

  'user_30d_interactions_author_rate',
  'user_30d_interactions_site_rate',
  'user_30d_interactions_subscription_rate',

  'global_30d_interactions_site_count',
  'global_30d_interactions_author_count',
  'global_30d_interactions_subscription_count',

  'global_30d_interactions_site_rate',
  'global_30d_interactions_author_rate',
  'global_30d_interactions_subscription_rate'
]

DB_PARAMS = {
  'dbname': os.getenv('DB_NAME') or 'omnivore',
  'user': os.getenv('DB_USER'),
  'password': os.getenv('DB_PASSWORD'),
  'host': os.getenv('DB_HOST') or 'localhost',
  'port': os.getenv('DB_PORT') or '5432'
}

USER_FEATURES = {
  "site": "user_30d_interactions_site",
  "author": "user_30d_interactions_author",
  "subscription": "user_30d_interactions_subscription",
}

GLOBAL_FEATURES = {
  "site": "global_30d_interactions_site",
  "author": "global_30d_interactions_author",
  "subscription": "global_30d_interactions_subscription",
}

def download_from_gcs(bucket_name, gcs_path, destination_path):
  storage_client = storage.Client()
  bucket = storage_client.bucket(bucket_name)
  blob = bucket.blob(gcs_path)
  blob.download_to_filename(destination_path)


def load_pipeline():
  bucket_name = os.getenv('GCS_BUCKET')
  pipeline_gcs_path = os.getenv('PIPELINE_GCS_PATH')
  download_from_gcs(bucket_name, pipeline_gcs_path, '/tmp/pipeline.pkl')
  pipeline = joblib.load('/tmp/pipeline.pkl')
  return pipeline


def load_pipeline_local():
  pipeline = joblib.load('predict_user_clicked_random_forest_pipeline-v001.pkl')
  return pipeline


def fetch_user_features(name, feature_name):
  conn = psycopg2.connect(**DB_PARAMS)
  cur = conn.cursor()
  query = f"SELECT user_id, {name}, interactions, interaction_rate FROM {feature_name}"

  cur.execute(query)
  data = cur.fetchall()

  cur.close()
  conn.close()
  columns = [
    "user_id",
    name,
    "interactions",
    "interaction_rate"
  ]

  rate_feature_name = f"{feature_name}_rate"
  count_feature_name = f"{feature_name}_count"

  df_loaded = pd.DataFrame(data, columns=columns)
  df_loaded = df_loaded.rename(columns={"interactions": count_feature_name}, errors="raise")
  df_loaded = df_loaded.rename(columns={"interaction_rate": rate_feature_name}, errors="raise")
  df_loaded[rate_feature_name] = df_loaded[rate_feature_name].fillna(0)
  df_loaded[count_feature_name] = df_loaded[count_feature_name].fillna(0)

  return df_loaded


def fetch_global_features(name, feature_name):
  conn = psycopg2.connect(**DB_PARAMS)
  cur = conn.cursor()
  query = f"SELECT {name}, interactions, interaction_rate FROM {feature_name}"

  cur.execute(query)
  data = cur.fetchall()

  cur.close()
  conn.close()
  columns = [
    name,
    "interactions",
    "interaction_rate"
  ]

  rate_feature_name = f"{feature_name}_rate"
  count_feature_name = f"{feature_name}_count"

  df_loaded = pd.DataFrame(data, columns=columns)
  df_loaded = df_loaded.rename(columns={"interactions": count_feature_name}, errors="raise")
  df_loaded = df_loaded.rename(columns={"interaction_rate": rate_feature_name}, errors="raise")
  df_loaded[rate_feature_name] = df_loaded[rate_feature_name].fillna(0)
  df_loaded[count_feature_name] = df_loaded[count_feature_name].fillna(0)

  return df_loaded


def load_user_features():
  result = {}
  for view_name in USER_FEATURES.keys():
    key_name = USER_FEATURES[view_name]
    result[key_name] = fetch_user_features(view_name, key_name)
    app.logger.info(f"loaded {len(result[key_name])} features for {key_name}")
  return result


def load_global_features():
  result = {}
  for view_name in GLOBAL_FEATURES.keys():
    key_name = GLOBAL_FEATURES[view_name]
    result[key_name] = fetch_global_features(view_name, key_name)
    app.logger.info(f"loaded {len(result[key_name])} features for {key_name}")
  return result


def compute_score(user_id, item_features):
  interaction_score = compute_interaction_score(user_id, item_features)
  return {
    'score': interaction_score,
    'interaction_score': interaction_score,
  }


def compute_time_bonus_score(item_features):
  saved_at = item_features['saved_at']
  current_time = datetime.now(pytz.utc)
  time_diff_hours = (current_time - saved_at).total_seconds() / 3600
  max_diff_hours = 3 * 24
  if time_diff_hours >= max_diff_hours:
      return 0.0
  else:
      return max(0.0, min(1.0, 1 - (time_diff_hours / max_diff_hours)))


def compute_interaction_score(user_id, item_features):
  print('item_features', item_features)
  df_test = pd.DataFrame([{
    'user_id': user_id,
    'author': item_features.get('author'),
    'site': item_features.get('site'),
    'subscription': item_features.get('subscription'),

    'item_has_thumbnail': 1 if item_features.get('has_thumbnail') else 0,
    "item_has_site_icon": 1 if item_features.get('has_site_icon') else 0,
  }])

  for name in USER_FEATURES.keys():
    feature_name = USER_FEATURES[name]
    df_feature = user_features[feature_name]
    df_test = df_test.merge(df_feature, on=['user_id', name], how='left')
    df_test[f"{feature_name}_rate"] = df_test[f"{feature_name}_rate"].fillna(0)
    df_test[f"{feature_name}_count"] = df_test[f"{feature_name}_count"].fillna(0)

  for name in GLOBAL_FEATURES.keys():
    feature_name = GLOBAL_FEATURES[name]
    df_feature = global_features[feature_name]
    df_test = df_test.merge(df_feature, on=name, how='left')
    df_test[f"{feature_name}_rate"] = df_test[f"{feature_name}_rate"].fillna(0)
    df_test[f"{feature_name}_count"] = df_test[f"{feature_name}_count"].fillna(0)

  df_predict = df_test[TRAIN_FEATURES]

  # Print out the columns with values, so we can know how sparse our data is
  #scored_columns = df_predict.columns[(df_predict.notnull() & (df_predict != 0)).any()].tolist()
  #print("scored columns", scored_columns)
  interaction_score = pipeline.predict_proba(df_predict)

  return interaction_score[0][1]


def get_library_item(library_item_id):
  conn = psycopg2.connect(**DB_PARAMS)
  cur = conn.cursor()
  query = """
  SELECT 
    li.title,
    li.author,
    li.saved_at,
    li.site_name as site,
    li.item_language as language,
    li.subscription,
    li.word_count,
    li.directionality,
    CASE WHEN li.thumbnail IS NOT NULL then 1 else 0 END as has_thumbnail,
    CASE WHEN li.site_icon IS NOT NULL then 1 else 0 END as has_site_icon
  FROM omnivore.library_item li
  WHERE li.id = %s
  """

  cur.execute(query, (library_item_id,))

  data = cur.fetchone()
  columns = [desc[0] for desc in cur.description]
  cur.close()
  conn.close()

  if data:
    item_dict = dict(zip(columns, data))
    return item_dict
  else:
    return None


@app.route('/_ah/health', methods=['GET'])
def ready():
  return jsonify({'OK': 'yes'}), 200


@app.route('/users/<user_id>/features', methods=['GET'])
def get_user_features(user_id):
  result = {}

  for name in USER_FEATURES.keys():
    feature_name = USER_FEATURES[name]
    rate_feature_name = f"{feature_name}_rate"
    count_feature_name = f"{feature_name}_count"
    df_feature = user_features[feature_name]
    df_filtered = df_feature[df_feature['user_id'] == user_id]
    if not df_filtered.empty:
      rate = df_filtered[[name, rate_feature_name]].dropna().to_dict(orient='records')
      count = df_filtered[[name, count_feature_name]].dropna().to_dict(orient='records')
      result[feature_name] = {
        'rate': rate,
        'count': count
      } 

  return jsonify(result), 200


@app.route('/users/<user_id>/library_items/<library_item_id>/score', methods=['GET'])
def get_library_item_score(user_id, library_item_id):
  item_features = get_library_item(library_item_id)
  score = compute_score(user_id, item_features)
  return jsonify({'score': score})


@app.route('/predict', methods=['POST'])
def predict():
  try:
    data = request.get_json()
    app.logger.info(f"predict scoring request: {data}")

    user_id = data.get('user_id')
    item_features = data.get('item_features')
    item_features['saved_at'] = dateutil.parser.isoparse(item_features['saved_at'])

    if user_id is None:
        return jsonify({'error': 'Missing user_id'}), 400

    score = compute_score(user_id, item_features)
    return jsonify({'score': score})
  except Exception as e:
    app.logger.error(f"exception in predict endpoint: {request.get_json()}\n{e}")
    return jsonify({'error': str(e)}), 500


@app.route('/batch', methods=['POST'])
def batch():
  try:
    result = {}
    data = request.get_json()
    app.logger.info(f"batch scoring request: {data}")

    user_id = data.get('user_id')
    items = data.get('items')

    if user_id is None:
        return jsonify({'error': 'Missing user_id'}), 400

    for key, item in items.items():
      print('key": ', key)
      print('item: ', item)
      library_item_id = item['library_item_id']
      item['saved_at'] = dateutil.parser.isoparse(item['saved_at'])
      result[library_item_id] = compute_score(user_id, item)

    return jsonify(result)
  except Exception as e:
    app.logger.error(f"exception in batch endpoint: {request.get_json()}\n{e}")
    return jsonify({'error': str(e)}), 500


if os.getenv('LOAD_LOCAL_MODEL'):
  pipeline = load_pipeline_local()
else:
  pipeline = load_pipeline()

user_features = load_user_features()
global_features = load_global_features()


if __name__ == '__main__':
  app.run(debug=True, port=5000)