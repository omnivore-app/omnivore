import pandas as pd
import os
import numpy as np
from datetime import datetime, timedelta

from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier, VotingClassifier

from sklearn.preprocessing import StandardScaler

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split
from sklearn2pmml import PMMLPipeline, sklearn2pmml

from google.cloud import storage
from google.cloud.exceptions import PreconditionFailed

import pickle
import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.feather as feather

from features.user_history import FEATURE_COLUMNS

DB_PARAMS = {
    'dbname': os.getenv('DB_NAME') or 'omnivore',
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST') or 'localhost',
    'port': os.getenv('DB_PORT') or '5432'
}

def parquet_to_dataframe(file_path):
    table = pq.read_table(file_path)
    df = table.to_pandas()
    return df

def save_to_pickle(object, output_file):
  with open(output_file, 'wb') as handle:
    pickle.dump(object, handle, protocol=pickle.HIGHEST_PROTOCOL)

def load_tables_from_pickle(pickle_file):
  with open(pickle_file, 'rb') as handle:
    tables = pickle.load(handle)
  return tables

def load_dataframes_from_pickle(pickle_file):
    result = {}
    tables = load_tables_from_pickle(pickle_file)
    for table_name in tables.keys():
        result[table_name] = tables[table_name].to_pandas()
    return result


def download_from_gcs(bucket_name, source_blob_name, destination_file_name):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)
    print(f'Blob {source_blob_name} downloaded to {destination_file_name}.')


def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    print(f"File {source_file_name} uploaded to {destination_blob_name}.")


def load_and_sample_library_items_from_parquet(raw_file_path, sample_size):
    df = parquet_to_dataframe(raw_file_path)
    sampled_df = df.sample(frac=sample_size, random_state=42)
    return sampled_df


def merge_user_preference_data(sampled_raw_df, feature_dict):
    merged_df = sampled_raw_df

    for key in feature_dict.keys():
        user_preference_df = feature_dict[key]
        if 'author' in key:
            merge_keys = ['user_id', 'author']
        elif 'site' in key:
            merge_keys = ['user_id', 'site']
        elif 'subscription' in key:
            merge_keys = ['user_id', 'subscription']
        elif 'original_url_host' in key:
            merge_keys = ['user_id', 'original_url_host']
        else:
            print("skipping feature: ", key)
            continue  # Skip files that don't match expected patterns
        merged_df = pd.merge(merged_df, user_preference_df, on=merge_keys, how='left')
        merged_df = merged_df.fillna(0)
    return merged_df

def prepare_data(df):
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['subscription_start_date'] = pd.to_datetime(df['subscription_start_date'], errors='coerce')

    df['is_subscription'] = df['subscription'].apply(lambda x: 1 if pd.notna(x) and x != '' else 0)
    df['has_author'] = df['author'].apply(lambda x: 1 if pd.notna(x) and x != '' else 0)

    # Calculate the days since subscribed
    df['days_since_subscribed'] = (df['created_at'] - df['subscription_start_date']).dt.days

    # Handle cases where subscription_start_date is NaT (Not a Time) or negative
    df['days_since_subscribed'] = df['days_since_subscribed'].apply(lambda x: x if x >= 0 else 0)
    df['days_since_subscribed'] = df['days_since_subscribed'].fillna(0).astype(int)

    df['is_feed'] = df['subscription_type'].apply(lambda x: 1 if x == 'RSS' else 0)
    df['is_newsletter'] = df['subscription_type'].apply(lambda x: 1 if x == 'NEWSLETTER' else 0)

    df = df.dropna(subset=['user_clicked'])

    # Fill NaNs in other columns with 0 (if any remain)
    df = df.fillna(0)

    X = df[FEATURE_COLUMNS] # .drop(columns=['user_id', 'user_clicked'])
    Y = df['user_clicked']

    return X, Y

def train_random_forest_model(X, Y):
    model = RandomForestClassifier(
        class_weight={0: 1, 1: 10}, 
        n_estimators=10, 
        max_depth=10, 
        random_state=42
    )

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, Y_train, Y_test = train_test_split(X_scaled, Y, test_size=0.3, random_state=42)

    pipeline = PMMLPipeline([
        ("scaler", scaler),
        ("classifier", model)
    ])

    pipeline.fit(X_train, Y_train)

    Y_pred = pipeline.predict(X_test)
    print_classification_report(Y_test, Y_pred)
    print_feature_importance(X, model)

    return pipeline


def print_feature_importance(X, rf):
    # Get feature importances
    importances = rf.feature_importances_

    # Get the indices of the features sorted by importance
    indices = np.argsort(importances)[::-1]

    # Print the feature ranking
    print("Feature ranking:")

    for f in range(X.shape[1]):
        print(f"{f + 1}. feature {indices[f]} ({importances[indices[f]]:.4f}) - {X.columns[indices[f]]}")



def print_classification_report(Y_test, Y_pred):
    report = classification_report(Y_test, Y_pred, target_names=['Not Clicked', 'Clicked'], output_dict=True)
    print("Classification Report:")
    print(f"Accuracy: {report['accuracy']:.4f}")
    print(f"Precision (Not Clicked): {report['Not Clicked']['precision']:.4f}")
    print(f"Recall (Not Clicked): {report['Not Clicked']['recall']:.4f}")
    print(f"F1-Score (Not Clicked): {report['Not Clicked']['f1-score']:.4f}")
    print(f"Precision (Clicked): {report['Clicked']['precision']:.4f}")
    print(f"Recall (Clicked): {report['Clicked']['recall']:.4f}")
    print(f"F1-Score (Clicked): {report['Clicked']['f1-score']:.4f}")


def main():
    execution_date = os.getenv('EXECUTION_DATE')
    num_days_history = os.getenv('NUM_DAYS_HISTORY')
    gcs_bucket_name = os.getenv('GCS_BUCKET')

    raw_data_path = f'raw_library_items_${execution_date}.parquet'
    user_history_path = 'features_user_features.pkl'
    pipeline_path = 'predict_read_pipeline-v002.pkl'

    download_from_gcs(gcs_bucket_name, f'data/features/user_features.pkl', user_history_path)
    download_from_gcs(gcs_bucket_name, f'data/raw/library_items_{execution_date}.parquet', raw_data_path)

    sampled_raw_df = load_and_sample_library_items_from_parquet(raw_data_path, 0.10)
    user_history = load_dataframes_from_pickle(user_history_path)

    merged_df = merge_user_preference_data(sampled_raw_df, user_history)

    print("created merged data", merged_df.columns)

    X, Y = prepare_data(merged_df)
    random_forest_pipeline = train_random_forest_model(X, Y)
    save_to_pickle(random_forest_pipeline, pipeline_path)
    upload_to_gcs(gcs_bucket_name, pipeline_path, f'data/models/{pipeline_path}')


if __name__ == "__main__":
    main()