import { SignedUrlParameters, StorageClient, File } from './StorageClient'
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Readable } from 'stream'

// While this is listed as S3, for self hosting we will use MinIO, which is
// S3 Compatible.
export class S3StorageClient implements StorageClient {
  private s3Client: S3Client
  private urlOverride: string | undefined

  constructor(urlOverride: string | undefined) {
    this.urlOverride = urlOverride
    this.s3Client = new S3Client({
      forcePathStyle: true,
      endpoint: urlOverride,
    })
  }

  private convertFileToGeneric(
    s3File: GetObjectCommandOutput
  ): Omit<File, 'bucket' | 'publicUrl'> {
    return {
      exists: () => {
        return Promise.resolve(s3File.$metadata.httpStatusCode == 200)
      },
      isPublic: async () => Promise.resolve(true),
      download: async () => this.getFileFromReadable(s3File.Body as Readable),
      getMetadataMd5: () => Promise.resolve(s3File.ETag),
    }
  }

  private getFileFromReadable(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.once('end', () => resolve(Buffer.concat(chunks)))
      stream.once('error', reject)
    })
  }

  async downloadFile(bucket: string, filePath: string): Promise<File> {
    const s3File = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: filePath, // path to the file you want to download,
      })
    )

    return {
      ...this.convertFileToGeneric(s3File),
      bucket: bucket,
      publicUrl: () => `${this.urlOverride ?? ''}/${bucket}/${filePath}`,
    }
  }

  async getFilesFromPrefix(bucket: string, prefix: string): Promise<File[]> {
    const s3PrefixedFiles = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix, // path to the file you want to download,
      })
    )

    const prefixKeys = s3PrefixedFiles.CommonPrefixes || []

    return prefixKeys
      .map(({ Prefix }) => Prefix)
      .map((key) => {
        return {
          exists: () => Promise.resolve(true),
          isPublic: async () => Promise.resolve(true),
          download: async () => {
            const s3File = await this.s3Client.send(
              new GetObjectCommand({
                Bucket: bucket,
                Key: key, // path to the file you want to download,
              })
            )

            return this.getFileFromReadable(s3File.Body as Readable)
          },
          getMetadataMd5: () => Promise.resolve(key),
          bucket: bucket,
          publicUrl: () => `${this.urlOverride ?? ''}/${bucket}/${key}`,
        }
      })
  }

  async signedUrl(
    bucket: string,
    filePath: string,
    options: SignedUrlParameters
  ): Promise<string> {
    const command =
      options.action == 'read'
        ? new GetObjectCommand({
            Bucket: bucket,
            Key: filePath, // path to the file you want to download,
          })
        : new PutObjectCommand({
            Bucket: bucket,
            Key: filePath, // path to the file you want to download,
          })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    })

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
    return this.s3Client
      .send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filePath,
          Body: data,
        })
      )
      .then(() => {})
  }
}
