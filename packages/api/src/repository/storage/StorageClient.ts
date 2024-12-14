import { PipelineSource, Writable } from 'stream'

export type SignedUrlParameters = {
  action: 'read' | 'write' | 'delete' | 'resumable'
  expires: number
}

export type SaveData = string | Buffer | PipelineSource<string | Buffer>
export type SaveOptions = {
  contentType?: string
  gzip?: string | boolean
  resumable?: boolean
  timeout?: number
  validation?: string | boolean
  private?: boolean | undefined
}

export type File = {
  isPublic: () => Promise<boolean>
  publicUrl: () => string
  download: () => Promise<Buffer>
  exists: () => Promise<boolean>
  save: (saveData: SaveData, saveOptions: SaveOptions) => Promise<void>
  createWriteStream: (saveOptions: SaveOptions) => Writable
  getMetadataMd5: () => Promise<string | undefined>
  bucket: string
  key: string
}

export interface StorageClient {
  downloadFile(bucket: string, filePath: string): Promise<File>

  createFile(bucket: string, filePath: string): File

  getFilesFromPrefix(bucket: string, filePrefix: string): Promise<File[]>

  upload(
    bucket: string,
    filePath: string,
    data: Buffer,
    options: { contentType?: string; public?: boolean; timeout?: number }
  ): Promise<void>

  signedUrl(
    bucket: string,
    filePath: string,
    options: SignedUrlParameters
  ): Promise<string>
}
