import { SignedUrlParameters, StorageClient, File } from './StorageClient'
import { Storage, File as GCSFile } from '@google-cloud/storage'

export class GcsStorageClient implements StorageClient {
  private storage: Storage

  constructor(keyFilename: string | undefined) {
    this.storage = new Storage({
      keyFilename,
    })
  }

  private convertFileToGeneric(gcsFile: GCSFile): File {
    return {
      isPublic: async () => {
        const [isPublic] = await gcsFile.isPublic()
        return isPublic
      },
      exists: async () => (await gcsFile.exists())[0],
      download: async () => (await gcsFile.download())[0],
      bucket: gcsFile.bucket.name,
      publicUrl: () => gcsFile.publicUrl(),
      getMetadataMd5: async () => {
        const [metadata] = await gcsFile.getMetadata()
        return metadata.md5Hash
      },
    }
  }

  downloadFile(bucket: string, filePath: string): Promise<File> {
    const file = this.storage.bucket(bucket).file(filePath)
    return Promise.resolve(this.convertFileToGeneric(file))
  }

  async getFilesFromPrefix(bucket: string, prefix: string): Promise<File[]> {
    const [filesWithPrefix] = await this.storage
      .bucket(bucket)
      .getFiles({ prefix })

    return filesWithPrefix.map((it: GCSFile) => this.convertFileToGeneric(it))
  }

  async signedUrl(
    bucket: string,
    filePath: string,
    options: SignedUrlParameters
  ): Promise<string> {
    const [url] = await this.storage
      .bucket(bucket)
      .file(filePath)
      .getSignedUrl({ ...options, version: 'v4' })

    return url
  }

  upload(
    bucket: string,
    filePath: string,
    data: Buffer,
    options: {
      contentType?: string
      public?: boolean
      timeout?: number
    }
  ): Promise<void> {
    return this.storage
      .bucket(bucket)
      .file(filePath)
      .save(data, { timeout: 30000, ...options })
  }
}
