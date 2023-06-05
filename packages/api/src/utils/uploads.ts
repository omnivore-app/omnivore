/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { File, GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { env } from '../env'
import { ContentReader, PageType } from '../generated/graphql'

export const contentReaderForPage = (
  pageType: PageType,
  uploadFileId: string | null | undefined
) => {
  if (!uploadFileId) {
    return ContentReader.Web
  }
  switch (pageType) {
    case PageType.Book:
      return ContentReader.Epub
    case PageType.File:
      return ContentReader.Pdf
    default:
      return ContentReader.Web
  }
}

/* On GAE/Prod, we shall rely on default app engine service account credentials.
 * Two changes needed: 1) add default service account to our uploads GCS Bucket
 * with create and view access. 2) add 'Service Account Token Creator' role to
 * the default app engine service account on the IAM page. We also need to
 * enable IAM related APIs on the project.
 */
const storage = env.fileUpload?.gcsUploadSAKeyFilePath
  ? new Storage({ keyFilename: env.fileUpload.gcsUploadSAKeyFilePath })
  : new Storage()
const bucketName = env.fileUpload.gcsUploadBucket

export const getFilePublicUrl = (filePathName: string): string => {
  return storage.bucket(bucketName).file(filePathName).publicUrl()
}

export const countOfFilesWithPrefix = async (prefix: string) => {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix })
  return files.length
}

export const generateUploadSignedUrl = async (
  filePathName: string,
  contentType: string,
  selectedBucket?: string
): Promise<string> => {
  // if (env.dev.isLocal) {
  //   return 'http://localhost:3000/uploads/' + filePathName
  // }

  // These options will allow temporary uploading of file with requested content type
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: contentType,
  }
  console.log('signed url for: ', options)

  // Get a v4 signed URL for uploading file
  const [url] = await storage
    .bucket(selectedBucket || bucketName)
    .file(filePathName)
    .getSignedUrl(options)
  return url
}

export const generateDownloadSignedUrl = async (
  filePathName: string
): Promise<string> => {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 240 * 60 * 1000, // four hours
  }
  const [url] = await storage
    .bucket(bucketName)
    .file(filePathName)
    .getSignedUrl(options)
  console.log('generating download signed url', url)
  return url
}

export const makeStorageFilePublic = async (
  id: string,
  fileName: string
): Promise<string> => {
  // if (env.dev.isLocal) {
  //   return 'http://localhost:3000/public/' + id + '/' + fileName
  // }

  // Makes the file public
  const filePathName = generateUploadFilePathName(id, fileName)
  await storage.bucket(bucketName).file(filePathName).makePublic()

  const fileObj = storage.bucket(bucketName).file(filePathName)
  return fileObj.publicUrl()
}

export const getStorageFileDetails = async (
  id: string,
  fileName: string
): Promise<{ md5Hash: string; fileUrl: string }> => {
  const filePathName = generateUploadFilePathName(id, fileName)
  const file = storage.bucket(bucketName).file(filePathName)
  const [metadata] = await file.getMetadata()
  // GCS returns MD5 Hash in base64 encoding, we convert it here to hex string
  const md5Hash = Buffer.from(metadata.md5Hash, 'base64').toString('hex')

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
  options?: { contentType?: string; public?: boolean },
  selectedBucket?: string
): Promise<void> => {
  await storage
    .bucket(selectedBucket || bucketName)
    .file(filePath)
    .save(data, options)
}

export const createGCSFile = (filename: string): File => {
  return storage.bucket(bucketName).file(filename)
}
