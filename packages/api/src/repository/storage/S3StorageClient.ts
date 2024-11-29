import {
  SignedUrlParameters,
  StorageClient,
  File,
  SaveOptions,
  SaveData,
} from './StorageClient'
import { Upload } from '@aws-sdk/lib-storage'
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'
import * as stream from 'node:stream'

// While this is listed as S3, for self hosting we will use MinIO, which is
// S3 Compatible.
export class S3StorageClient implements StorageClient {
  BlankFile = class implements File {
    bucket: string
    key: string
    s3Client: S3StorageClient
    downloadedFile: File | undefined

    constructor(s3StorageClass: S3StorageClient, bucket: string, file: string) {
      this.bucket = bucket
      this.key = file
      this.s3Client = s3StorageClass
    }

    isPublic() {
      return Promise.resolve(true)
    }

    publicUrl() {
      return `${this.s3Client.urlOverride ?? ''}/${this.bucket}/${this.key}`
    }

    async download(): Promise<Buffer> {
      this.downloadedFile = await this.s3Client.downloadFile(
        this.bucket,
        this.key
      )
      return this.downloadedFile.download()
    }

    async exists() {
      try {
        await this.s3Client.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucket,
            Key: this.key,
          })
        )

        return true
      } catch (e) {
        if (
          e instanceof S3ServiceException &&
          e.$metadata.httpStatusCode == 404
        ) {
          return false
        }

        throw e
      }
    }

    save(saveData: SaveData, saveOptions: SaveOptions): Promise<void> {
      return this.s3Client.upload(this.bucket, this.key, saveData, saveOptions)
    }

    createWriteStream(saveOptions: SaveOptions) {
      return this.s3Client.createS3UploadStream(
        this.bucket,
        this.key,
        saveOptions
      )
    }

    getMetadataMd5() {
      return this.downloadedFile?.getMetadataMd5() || Promise.resolve('')
    }
  }

  private s3Client: S3Client
  private urlOverride: string | undefined

  constructor(urlOverride: string | undefined) {
    this.urlOverride = urlOverride
    this.s3Client = new S3Client({
      forcePathStyle: true,
      endpoint: urlOverride,
    })
  }

  private createS3UploadStream = (
    bucket: string,
    key: string,
    saveOptions: SaveOptions
  ) => {
    const passThroughStream = new stream.PassThrough()

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: passThroughStream,
        ContentType: saveOptions.contentType,
      },
    })

    void upload.done().then((res) => {
      console.log(`Successfully Uploaded File ${res.Key ?? ''}`)
    })

    return passThroughStream
  }

  private convertFileToGeneric(
    s3File: GetObjectCommandOutput,
    bucket: string,
    key: string
  ): File {
    return {
      exists: () => {
        return Promise.resolve(s3File.$metadata.httpStatusCode == 200)
      },
      save: async () => Promise.resolve(),
      isPublic: async () => Promise.resolve(true),
      download: async () => this.getFileFromReadable(s3File.Body as Readable),
      getMetadataMd5: () => Promise.resolve(s3File.ETag),
      createWriteStream: (saveOptions: SaveOptions) =>
        this.createS3UploadStream(bucket, key, saveOptions),
      publicUrl: () => `${this.urlOverride ?? ''}/${bucket}/${key}`,
      bucket,
      key,
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

    return this.convertFileToGeneric(s3File, bucket, filePath)
  }

  createFile(bucket: string, filePath: string): File {
    return new this.BlankFile(this, bucket, filePath) as unknown as File
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
      .map((key: string | undefined) => {
        return {
          key: key || '',
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
          save: () => Promise.resolve(),
          createWriteStream: (saveOptions: SaveOptions) =>
            new stream.PassThrough(),
          getMetadataMd5: () => Promise.resolve(key),
          bucket: bucket,
          publicUrl: () => `${this.urlOverride ?? ''}/${bucket}/${key ?? ''}`,
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

  async upload(
    bucket: string,
    filePath: string,
    data: SaveData,
    options: {
      contentType?: string
      public?: boolean
      timeout?: number
    }
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filePath,
        Body: data.toString(),
        ContentType: options.contentType,
      })
    )
  }
}
