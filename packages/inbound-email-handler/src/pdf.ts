import axios, { AxiosResponse } from 'axios'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'

const signToken = promisify(jwt.sign)

type UploadResponse = {
  id: string
  url: string
}

export const handlePdfAttachment = async (
  email: string,
  fileName: string,
  data: string
): Promise<void> => {
  console.log('handlePdfAttachment', email, fileName)

  try {
    const uploadResult = await getUploadIdAndSignedUrl(email, fileName)
    if (!uploadResult.url || !uploadResult.id) {
      console.log('failed to create upload request', uploadResult)
      return
    }
    await uploadToSignedUrl(uploadResult.url, data)
    await createArticle(email, uploadResult.id)
  } catch (error) {
    console.error('handlePdfAttachment error', error)
  }
}

const getUploadIdAndSignedUrl = async (
  email: string,
  fileName: string
): Promise<UploadResponse> => {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)
  const data = {
    fileName,
    email,
  }

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }
  const response = await axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/pdf-attachments/upload`,
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
  data: string
): Promise<AxiosResponse> => {
  return axios.put(uploadUrl, data, {
    headers: {
      'Content-Type': 'application/pdf',
    },
    maxBodyLength: 1000000000,
    maxContentLength: 100000000,
  })
}

const createArticle = async (
  email: string,
  uploadFileId: string
): Promise<AxiosResponse> => {
  const data = {
    email,
    uploadFileId,
  }

  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined')
  }
  const auth = await signToken(email, process.env.JWT_SECRET)

  if (process.env.INTERNAL_SVC_ENDPOINT === undefined) {
    throw new Error('REST_BACKEND_ENDPOINT is not defined')
  }
  return axios.post(
    `${process.env.INTERNAL_SVC_ENDPOINT}svc/pdf-attachments/create-article`,
    data,
    {
      headers: {
        Authorization: `${auth as string}`,
        'Content-Type': 'application/json',
      },
    }
  )
}
