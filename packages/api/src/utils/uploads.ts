/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios'
import { ContentReaderType } from '../entity/library_item'
import { env } from '../env'
import { PageType } from '../generated/graphql'
import { ContentFormat } from '../jobs/upload_content'
import { logger } from './logger'
import { storage } from '../repository/storage/storage'

export const contentReaderForLibraryItem = (
  itemType: string,
  uploadFileId: string | null | undefined
) => {
  if (!uploadFileId) {
    return ContentReaderType.WEB
  }
  switch (itemType) {
    case PageType.Book:
      return ContentReaderType.EPUB
    case PageType.File:
      return ContentReaderType.PDF
    default:
      return ContentReaderType.WEB
  }
}

/* On GAE/Prod, we shall rely on default app engine service account credentials.
 * Two changes needed: 1) add default service account to our uploads GCS Bucket
 * with create and view access. 2) add 'Service Account Token Creator' role to
 * the default app engine service account on the IAM page. We also need to
 * enable IAM related APIs on the project.
 */

const bucketName = env.fileUpload.gcsUploadBucket
const maxContentLength = 10 * 1024 * 1024 // 10MB

export const countOfFilesWithPrefix = async (prefix: string) => {
  const files = await storage.getFilesFromPrefix(bucketName, prefix)
  return files.length
}

export const generateUploadSignedUrl = async (
  filePathName: string,
  contentType: string,
  selectedBucket?: string
): Promise<string> => {
  // These options will allow temporary uploading of file with requested content type
  const options = {
    version: 'v4',
    action: 'write' as const,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: contentType,
  }
  logger.info('signed url for: ', options)

  return storage.signedUrl(selectedBucket || bucketName, filePathName, options)
}

export const generateDownloadSignedUrl = async (
  filePathName: string,
  config?: {
    expires?: number
  }
): Promise<string> => {
  const options = {
    action: 'read' as const,
    expires: Date.now() + 240 * 60 * 1000, // four hours
    ...config,
  }
  return storage.signedUrl(bucketName, filePathName, options)
}

export const getStorageFileDetails = async (
  id: string,
  fileName: string
): Promise<{ md5Hash: string; fileUrl: string }> => {
  const filePathName = generateUploadFilePathName(id, fileName)
  const file = await storage.downloadFile(bucketName, filePathName)
  const metadataMd5 = await file.getMetadataMd5()
  // GCS returns MD5 Hash in base64 encoding, we convert it here to hex string
  const md5Hash = Buffer.from(metadataMd5 || '', 'base64').toString('hex')

  return { md5Hash, fileUrl: file.publicUrl() }
}

export const generateUploadFilePathName = (
  id: string,
  fileName: string
): string => {
  return `u/${id}/${fileName}`
}

export const uploadToBucket = async (
  filePath: string,
  data: Buffer,
  options?: { contentType?: string; public?: boolean; timeout?: number },
  selectedBucket?: string
): Promise<void> => {
  await storage.upload(selectedBucket || bucketName, filePath, data, {
    timeout: 30000,
    ...options,
  })
}

export const downloadFromUrl = async (
  contentObjUrl: string,
  timeout?: number
) => {
  // download the content as stream and max 10MB
  const response = await axios.get<Buffer>(contentObjUrl, {
    responseType: 'stream',
    maxContentLength,
    timeout,
  })

  return response.data
}

export const uploadToSignedUrl = async (
  uploadSignedUrl: string,
  data: Buffer,
  contentType: string,
  timeout?: number
) => {
  // upload the stream to the signed url
  await axios.put(uploadSignedUrl, data, {
    headers: {
      'Content-Type': contentType,
    },
    maxBodyLength: maxContentLength,
    timeout,
  })
}

export const isFileExists = async (filePath: string): Promise<boolean> => {
  const file = await storage.downloadFile(bucketName, filePath)
  const exists = await file.exists()
  return exists
}

export const downloadFromBucket = async (filePath: string): Promise<Buffer> => {
  const file = await storage.downloadFile(bucketName, filePath)
  return file.download()
}

export const contentFilePath = ({
  userId,
  libraryItemId,
  format,
  savedAt,
  updatedAt,
}: {
  userId: string
  libraryItemId: string
  format: ContentFormat
  savedAt?: Date
  updatedAt?: Date
}) => {
  // Use updatedAt for highlightedMarkdown format because highlights are saved
  const date = format === 'highlightedMarkdown' ? updatedAt : savedAt

  if (!date) {
    throw new Error('Date not found')
  }

  return `content/${userId}/${libraryItemId}.${date.getTime()}.${format}`
}
