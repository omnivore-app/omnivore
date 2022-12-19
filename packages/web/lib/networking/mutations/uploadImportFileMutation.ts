import { gqlFetcher } from '../networkHelpers'
import { v4 as uuidv4 } from 'uuid'

export type UploadImportFileType = 'URL_LIST' | 'POCKET'

type UploadImportFileResponseData = {
  uploadImportFile?: UploadImportFileData
}

type UploadImportFileData = {
  uploadSignedUrl: string
  errorCodes?: unknown[]
}

export async function uploadImportFileRequestMutation(
  type: UploadImportFileType,
  contentType: string
): Promise<UploadImportFileData | undefined> {
  const mutation = `
    mutation UploadImportFile($type: UploadImportFileType!, $contentType: String!) {
      uploadImportFile(type:$type, contentType:$contentType) {
        ... on UploadImportFileError {
          errorCodes
        }
        ... on UploadImportFileSuccess {
          uploadSignedUrl
        }
      }
    }`

  const data = await gqlFetcher(mutation, { type, contentType })
  console.log('UploadImportFile: ', data)
  const output = data as UploadImportFileResponseData | undefined
  const error = output?.uploadImportFile?.errorCodes?.find(() => true)
  console.log('error: ', error)
  if (error) {
    throw error
  }
  return output?.uploadImportFile
}
