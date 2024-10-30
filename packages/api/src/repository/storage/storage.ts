import { env } from '../../env'
import { S3StorageClient } from './S3StorageClient'
import { GcsStorageClient } from './GcsStorageClient'

export const storage = env.fileUpload.useLocalStorage
  ? new S3StorageClient(env.fileUpload.localMinioUrl)
  : new GcsStorageClient(env.fileUpload?.gcsUploadSAKeyFilePath)
