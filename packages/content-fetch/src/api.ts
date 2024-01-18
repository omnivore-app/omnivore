import axios from 'axios'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'

const signToken = promisify(jwt.sign)

const IMPORTER_METRICS_COLLECTOR_URL =
  process.env.IMPORTER_METRICS_COLLECTOR_URL
const JWT_SECRET = process.env.JWT_SECRET
const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

if (!IMPORTER_METRICS_COLLECTOR_URL || !JWT_SECRET || !REST_BACKEND_ENDPOINT) {
  throw new Error('Missing environment variables')
}

const REQUEST_TIMEOUT = 30000 // 30 seconds

export const uploadToSignedUrl = async (
  uploadSignedUrl: string,
  contentType: string,
  contentObjUrl: string
) => {
  try {
    const stream = await axios.get(contentObjUrl, {
      responseType: 'stream',
      timeout: REQUEST_TIMEOUT,
    })
    return axios.put(uploadSignedUrl, stream.data, {
      headers: {
        'Content-Type': contentType,
      },
      maxBodyLength: 1000000000,
      maxContentLength: 100000000,
      timeout: REQUEST_TIMEOUT,
    })
  } catch (error) {
    console.error('error uploading to signed url', error)
    return null
  }
}

interface UploadFileResponse {
  data: {
    uploadFileRequest: {
      id: string
      uploadSignedUrl: string
      uploadFileId: string
      createdPageId: string
      errorCodes?: string[]
    }
  }
}

export const getUploadIdAndSignedUrl = async (
  userId: string,
  url: string,
  articleSavingRequestId: string
) => {
  const auth = await signToken({ uid: userId }, JWT_SECRET)
  const data = JSON.stringify({
    query: `mutation UploadFileRequest($input: UploadFileRequestInput!) {
      uploadFileRequest(input:$input) {
        ... on UploadFileRequestError {
          errorCodes
        }
        ... on UploadFileRequestSuccess {
          id
          uploadSignedUrl
        }
      }
    }`,
    variables: {
      input: {
        url,
        contentType: 'application/pdf',
        clientRequestId: articleSavingRequestId,
      },
    },
  })

  try {
    const response = await axios.post<UploadFileResponse>(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth as string};`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )

    if (
      response.data.data.uploadFileRequest.errorCodes &&
      response.data.data.uploadFileRequest.errorCodes?.length > 0
    ) {
      console.error(
        'Error while getting upload id and signed url',
        response.data.data.uploadFileRequest.errorCodes[0]
      )
      return null
    }

    return response.data.data.uploadFileRequest
  } catch (e) {
    console.error('error getting upload id and signed url', e)
    return null
  }
}

interface CreateArticleResponse {
  data: {
    createArticle: {
      createdArticle: {
        id: string
      }
      errorCodes: string[]
    }
  }
}

export const uploadPdf = async (
  url: string,
  userId: string,
  articleSavingRequestId: string
) => {
  const uploadResult = await getUploadIdAndSignedUrl(
    userId,
    url,
    articleSavingRequestId
  )
  if (!uploadResult) {
    throw new Error('error while getting upload id and signed url')
  }
  const uploaded = await uploadToSignedUrl(
    uploadResult.uploadSignedUrl,
    'application/pdf',
    url
  )
  if (!uploaded) {
    throw new Error('error while uploading pdf')
  }
  return uploadResult.id
}

export const sendCreateArticleMutation = async (
  userId: string,
  input: unknown
) => {
  const data = JSON.stringify({
    query: `mutation CreateArticle ($input: CreateArticleInput!){
          createArticle(input:$input){
            ... on CreateArticleSuccess{
              createdArticle{
                id
            }
        }
          ... on CreateArticleError{
              errorCodes
          }
      }
    }`,
    variables: {
      input,
    },
  })

  const auth = await signToken({ uid: userId }, JWT_SECRET)
  try {
    const response = await axios.post<CreateArticleResponse>(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth as string};`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )

    if (
      response.data.data.createArticle.errorCodes &&
      response.data.data.createArticle.errorCodes.length > 0
    ) {
      console.error(
        'error while creating article',
        response.data.data.createArticle.errorCodes[0]
      )
      return null
    }

    return response.data.data.createArticle
  } catch (error) {
    console.error('error creating article', error)
    return null
  }
}

interface SavePageResponse {
  data: {
    savePage: {
      url: string
      clientRequestId: string
      errorCodes?: string[]
    }
  }
}

export const sendSavePageMutation = async (userId: string, input: unknown) => {
  const data = JSON.stringify({
    query: `mutation SavePage ($input: SavePageInput!){
          savePage(input:$input){
            ... on SaveSuccess{
              url
              clientRequestId
            }
            ... on SaveError{
                errorCodes
            }
          }
    }`,
    variables: {
      input,
    },
  })

  const auth = await signToken({ uid: userId }, JWT_SECRET)
  try {
    const response = await axios.post<SavePageResponse>(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth as string};`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )

    if (
      response.data.data.savePage.errorCodes &&
      response.data.data.savePage.errorCodes.length > 0
    ) {
      console.error(
        'error while saving page',
        response.data.data.savePage.errorCodes[0]
      )
      if (response.data.data.savePage.errorCodes[0] === 'UNAUTHORIZED') {
        return { error: 'UNAUTHORIZED' }
      }

      return null
    }

    return response.data.data.savePage
  } catch (error) {
    console.error('error saving page', error)
    return null
  }
}

export const saveUploadedPdf = async (
  userId: string,
  url: string,
  uploadFileId: string,
  articleSavingRequestId: string,
  state: string,
  labels: string[],
  source: string,
  folder: string
) => {
  return sendCreateArticleMutation(userId, {
    url: encodeURI(url),
    articleSavingRequestId,
    uploadFileId: uploadFileId,
    state,
    labels,
    source,
    folder,
  })
}

export const sendImportStatusUpdate = async (
  userId: string,
  taskId: string,
  status: string
) => {
  try {
    const auth = await signToken({ uid: userId }, JWT_SECRET)

    await axios.post(
      IMPORTER_METRICS_COLLECTOR_URL,
      {
        taskId,
        status,
      },
      {
        headers: {
          Authorization: auth as string,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )
  } catch (e) {
    console.error('error while sending import status update', e)
  }
}
