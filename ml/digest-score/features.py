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

from features.extract import extract_and_upload_raw_data
from features.user_history import generate_and_upload_user_history



def main():
  execution_date = os.getenv('EXECUTION_DATE')
  num_days_history = os.getenv('NUM_DAYS_HISTORY')
  gcs_bucket_name = os.getenv('GCS_BUCKET')

  extract_and_upload_raw_data(execution_date, num_days_history, gcs_bucket_name)
  generate_and_upload_user_history(execution_date, gcs_bucket_name)

  print("done")

if __name__ == "__main__":
    main()