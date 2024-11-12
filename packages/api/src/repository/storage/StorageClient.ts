export type SignedUrlParameters = {
  action: 'read' | 'write' | 'delete' | 'resumable'
  expires: number
}

export type File = {
  isPublic: () => Promise<boolean>
  publicUrl: () => string
  download: () => Promise<Buffer>
  exists: () => Promise<boolean>
  getMetadataMd5: () => Promise<string | undefined>
  bucket: string
}

export interface StorageClient {
  downloadFile(bucket: string, filePath: string): Promise<File>

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
