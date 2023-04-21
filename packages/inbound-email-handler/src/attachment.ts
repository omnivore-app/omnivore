import axios, { AxiosResponse } from 'axios'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'

const signToken = promisify(jwt.sign)

export interface Attachment {
  contentType: string
  data: Buffer
  filename: string | undefined
}

type UploadResponse = {
  id: string
  url: string
}

export const isAttachment = (contentType: string, data: Buffer): boolean => {
  return (
    (contentType === 'application/pdf' ||
      contentType === 'application/epub+zip') &&
    data.length > 0
  )
}

export const handleAttachments = async (
  email: string,
  subject: string,
  attachments: Attachment[],
  receivedEmailId: string
): Promise<void> => {
  for await (const attachment of attachments) {
    const { contentType, data } = attachment
    const filename =
      attachment.filename || contentType === 'application/pdf'
        ? 'attachment.pdf'
        : 'attachment.epub'

    try {
      const uploadResult = await getUploadIdAndSignedUrl(
        email,
        filename,
        contentType
      )
      if (!uploadResult.url || !uploadResult.id) {
        console.log('failed to create upload request', uploadResult)
        return
      }
      await uploadToSignedUrl(uploadResult.url, data, contentType)
      await createArticle(email, uploadResult.id, subject, receivedEmailId)
    } catch (error) {
      console.error('handleAttachments error', error)
    }
  }
}

const getUploadIdAndSignedUrl = async (
  email: string,
  fileName: string,
  contentType: string
): Promise<UploadResponse> => {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)
  const data = {
    fileName,
    email,
    contentType,
  }

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }
  const response = await axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/email-attachment/upload`,
    data,
    {
      headers: {
        Authorization: `${auth as string}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data as UploadResponse
}

const uploadToSignedUrl = async (
  uploadUrl: string,
  data: Buffer,
  contentType: string
): Promise<AxiosResponse> => {
  return axios.put(uploadUrl, data, {
    headers: {
      'Content-Type': contentType,
    },
    maxBodyLength: 1000000000,
    maxContentLength: 100000000,
  })
}

const createArticle = async (
  email: string,
  uploadFileId: string,
  subject: string,
  receivedEmailId: string
): Promise<AxiosResponse> => {
  const data = {
    email,
    uploadFileId,
    subject,
    receivedEmailId,
  }

  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }
  return axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/email-attachment/create-article`,
    data,
    {
      headers: {
        Authorization: `${auth as string}`,
        'Content-Type': 'application/json',
      },
    }
  )
}
