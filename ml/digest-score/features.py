import psycopg2
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

import os
from io import BytesIO
import tempfile
import requests

import pyarrow as pa
import pyarrow.parquet as pq
from google.cloud import storage

from features.extract import extract_and_upload_raw_data
from features.user_history import generate_and_upload_user_history

from datetime import datetime, timezone
from auth import generate_admin_token


def call_refresh_api(api):
  headers = {
    'Authorization': f'Bearer {generate_admin_token()}'
  }
  try:
    response = requests.get(api, headers=headers, timeout=10)
    if response.status_code == 200:
        print("scoring service refreshed")
    else:
        print(f"failed to refresh scoring service: {response.status_code}")
  except requests.exceptions.Timeout:
      print(f"The request timed out after {timeout} seconds")
  except requests.exceptions.RequestException as e:
      print(f"An error occurred while refreshing scoring service: {e}")


def main():
  score_service = os.getenv("SCORING_SERVICE_URL")
  num_days_history = os.getenv('NUM_DAYS_HISTORY')
  gcs_bucket_name = os.getenv('GCS_BUCKET')

  current_date_utc = datetime.now(timezone.utc)
  execution_date = current_date_utc.strftime("%Y-%m-%d")
  print(f'updating features using execution date: {execution_date}')

  extract_and_upload_raw_data(execution_date, num_days_history, gcs_bucket_name)
  generate_and_upload_user_history(execution_date, gcs_bucket_name)

  if score_service:
    call_refresh_api(score_service)

  print("done")

if __name__ == "__main__":
    main()