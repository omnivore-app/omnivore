import psycopg2
import pandas as pd
import joblib
from datetime import datetime

import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn2pmml import PMMLPipeline, sklearn2pmml
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

from google.cloud import storage
from google.cloud.exceptions import PreconditionFailed


DB_PARAMS = {
    'dbname': os.getenv('DB_NAME') or 'omnivore',
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST') or 'localhost',
    'port': os.getenv('DB_PORT') or '5432'
}


TRAIN_FEATURES = [
     #   "item_word_count",
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


def fetch_data(sample_size):
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    query = f"""
        SELECT 
        user_id,
        created_at,
        item_folder,
        item_type,
        language,
        content_reader,
        directionality,
        item_word_count,
        item_has_thumbnail,
        item_has_site_icon,
        site,
        author,
        subscription,
        item_subscription_type,
        user_clicked,
        user_read,
        user_long_read

        FROM user_7d_activity LIMIT {sample_size}
    """

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    conn.close()
    columns = [
        "user_id",
        "created_at",
        "item_folder",
        "item_type",
        "language",
        "content_reader",
        "directionality",
        "item_word_count",
        "item_has_thumbnail",
        "item_has_site_icon",
        "site",
        "author",
        "subscription",
        "item_subscription_type",
        "user_clicked",
        "user_read",
        "user_long_read",
    ]

    df = pd.DataFrame(data, columns=columns)
    return df


def add_user_features(df, name, feature_name):
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
    df_merged = pd.merge(df, df_loaded[['user_id', name, rate_feature_name, count_feature_name]], on=['user_id',name], how='left')

    df_merged[rate_feature_name] = df_merged[rate_feature_name].fillna(0)
    df_merged[count_feature_name] = df_merged[count_feature_name].fillna(0)

    return df_merged


def add_global_features(df, name, feature_name):
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

    df_merged = pd.merge(df, df_loaded[[name, count_feature_name, rate_feature_name]], on=name, how='left')

    df_merged[rate_feature_name] = df_merged[rate_feature_name].fillna(0)
    df_merged[count_feature_name] = df_merged[count_feature_name].fillna(0)
    return df_merged


def add_dummy_features(df):
    known_folder_types = ['inbox', 'following']
    known_subscription_types = ['NEWSLETTER', 'RSS']
    # known_item_types = ['ARTICLE', 'BOOK', 'FILE', 'HIGHLIGHTS', 'IMAGE', 'PROFILE', 'TWEET', 'UNKNOWN','VIDEO','WEBSITE']
    #known_content_reader_types = ['WEB', 'PDF', 'EPUB']
    # known_directionality_types = ['LTR', 'RTL']

    folder_dummies = pd.get_dummies(df['item_folder'], columns=known_subscription_types, prefix='item_folder')
    subscription_type_dummies = pd.get_dummies(df['item_subscription_type'], columns=known_subscription_types, prefix='item_subscription_type')

    # item_type_dummies = pd.get_dummies(df['item_type'], columns=known_item_types, prefix='item_type')
    # content_reader_dummies = pd.get_dummies(df['content_reader'], columns=known_content_reader_types, prefix='content_reader')
    # directionality_dummies = pd.get_dummies(df['directionality'], columns=known_directionality_types, prefix='directionality')
    # language_dummies = pd.get_dummies(df['language'], prefix='language')

    # if 'title_topic' in df.columns:
    #     title_topic_dummies = pd.get_dummies(df['title_topic'], prefix='title_topic')

    new_feature_names = list(subscription_type_dummies.columns) + list(folder_dummies.columns)
    print("NEW FEATURE NAMES: ", new_feature_names)
    # new_feature_names = list(item_type_dummies.columns) + list(content_reader_dummies.columns) + \
    #                     list(directionality_dummies.columns) + list(language_dummies.columns)

    # if 'title_topic' in df.columns:
    #     new_feature_names += list(title_topic_dummies.columns)
    # , title_topic_dummies
    return pd.concat([df, subscription_type_dummies, folder_dummies], axis=1), new_feature_names


def random_forest_predictor(df, feature_columns, user_interaction):
    features = df[feature_columns]

    features = features.fillna(0)
    target = df[user_interaction]

    X = features
    y = target.values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    rf_classifier = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)

    pipeline = PMMLPipeline([
        ("scaler", scaler),
        ("classifier", rf_classifier)
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    feature_importance = rf_classifier.feature_importances_

    print("Feature Importance:")
    for feature, importance in zip(feature_columns, feature_importance):
        print(f"{feature}: {importance}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return pipeline


def save_and_upload_model(pipeline, target_interaction_type, bucket_name):
    pipeline_file_name = f'predict_{target_interaction_type}_random_forest_pipeline-v001.pkl'
    joblib.dump(pipeline, pipeline_file_name)

    if bucket_name:
        upload_to_gcs(bucket_name, pipeline_file_name, f'models/{pipeline_file_name}')
    else:
        print("No GCS credentials so i am not uploading")


def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    print(f"File {source_file_name} uploaded to {destination_blob_name}.")


def resample_data(df):
    print("Initial distribution:\n", df['user_clicked'].value_counts())

    # Separate the majority and minority classes
    df_majority = df[df['user_clicked'] == False]
    df_minority = df[df['user_clicked'] == True]

    # Resample the minority class
    df_minority_oversampled = df_minority.sample(n=len(df_majority), replace=True, random_state=42)

    # Combine the majority class with the oversampled minority class
    df_balanced = pd.concat([df_majority, df_minority_oversampled])

    # Shuffle the DataFrame to mix the classes
    df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)

    # Check the new distribution
    print("Balanced distribution:\n", df_balanced['user_clicked'].value_counts())

    # Display the first few rows of the balanced DataFrame
    print(df_balanced.head())

    return df_balanced

def main():
    sample_size = int(os.getenv('SAMPLE_SIZE')) or 1000
    num_days_history = int(os.getenv('NUM_DAYS_HISTORY')) or 21
    gcs_bucket = os.getenv('GCS_BUCKET')

    print("about to fetch library data")
    df = fetch_data(sample_size)
    print("FETCHED", df)

    df = add_user_features(df, 'author', 'user_30d_interactions_author')
    df = add_user_features(df, 'site', 'user_30d_interactions_site')
    df = add_user_features(df, 'subscription', 'user_30d_interactions_subscription')
    df = add_global_features(df, 'site', 'global_30d_interactions_site')
    df = add_global_features(df, 'author', 'global_30d_interactions_author')
    df = add_global_features(df, 'subscription', 'global_30d_interactions_subscription')

    df = resample_data(df)
    print("training RandomForest with number of library_items: ", len(df))
    pipeline = random_forest_predictor(df, TRAIN_FEATURES, 'user_clicked')

    print(f"uploading model and scaler to {gcs_bucket}")
    save_and_upload_model(pipeline, 'user_clicked', gcs_bucket)

    print("done")

if __name__ == "__main__":
    main()