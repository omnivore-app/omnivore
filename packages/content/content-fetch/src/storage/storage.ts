import { S3StorageClient } from './S3StorageClient'
import { GcsStorageClient } from './GcsStorageClient'

export const storage =
  process.env.GCS_USE_LOCAL_HOST === 'true'
    ? new S3StorageClient(
        process.env.LOCAL_MINIO_URL,
        process.env.AWS_S3_ENDPOINT_URL
      )
    : new GcsStorageClient(
        process.env.GCS_UPLOAD_SA_KEY_FILE_PATH ?? undefined
      )
