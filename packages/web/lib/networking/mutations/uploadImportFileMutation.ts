import { gqlFetcher } from '../networkHelpers'

export enum UploadImportFileType {
  URL_LIST = 'URL_LIST',
  POCKET = 'POCKET',
  MATTER = 'MATTER',
}

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
  const output = data as UploadImportFileResponseData | undefined
  const error = output?.uploadImportFile?.errorCodes?.find(() => true)
  if (error) {
    throw error
  }
  return output?.uploadImportFile
}
