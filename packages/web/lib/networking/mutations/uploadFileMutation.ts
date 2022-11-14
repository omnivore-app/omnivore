import { gqlFetcher } from '../networkHelpers'
import { v4 as uuidv4 } from 'uuid'


type UploadFileInput = {
  url: string
  contentType: string 
  createPageEntry?: Boolean
  clientRequestId?: string
}

type UploadFileOutput = {
  jobId?: string
  url?: string
  clientRequestId?: string
}

type UploadFileResponseData = {
  uploadFileRequest?: UploadFileData
  errorCodes?: unknown[]
}

type UploadFileData = {
  id: string
  uploadSignedUrl: string
}

export async function uploadFileRequestMutation(
  input: UploadFileInput
): Promise<UploadFileData | undefined> {
  const mutation = `
    mutation UploadFileRequest($input: UploadFileRequestInput!) {
      uploadFileRequest(input:$input) {
        ... on UploadFileRequestError {
          errorCodes
        }
        ... on UploadFileRequestSuccess {
          id
          uploadSignedUrl
        }
      }
    }`

  if (!input.clientRequestId) {
    input.clientRequestId = uuidv4()
  }

  const data = await gqlFetcher(mutation, { input })
  const output = data as UploadFileResponseData | undefined
  const error = output?.errorCodes?.find(() => true)
  if (error) {
    throw error
  }
  console.log("RESPONSE DATA: ", data)
  return output?.uploadFileRequest
}
