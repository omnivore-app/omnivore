/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ResolverFn,
  UploadFileRequestResult,
  MutationUploadFileRequestArgs,
  UploadFileStatus,
  UploadFileRequestErrorCode,
} from '../../generated/graphql'
import { WithDataSourcesContext } from '../types'
import {
  generateUploadSignedUrl,
  generateUploadFilePathName,
} from '../../utils/uploads'
import path from 'path'
import normalizeUrl from 'normalize-url'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

export const uploadFileRequestResolver: ResolverFn<
  UploadFileRequestResult,
  unknown,
  WithDataSourcesContext,
  MutationUploadFileRequestArgs
> = async (_obj, { input }, { models, kx, claims }) => {
  let uploadFileData: { id: string | null } = {
    id: null,
  }

  if (!claims?.uid) {
    return { errorCodes: [UploadFileRequestErrorCode.Unauthorized] }
  }

  analytics.track({
    userId: claims.uid,
    event: 'file_upload_request',
    properties: {
      url: input.url,
      env: env.server.apiEnv,
    },
  })

  let fileName: string
  try {
    const url = normalizeUrl(new URL(input.url).href, {
      stripHash: true,
      stripWWW: false,
    })
    fileName = decodeURI(path.basename(new URL(url).pathname)).replace(
      /[^a-zA-Z0-9-_.]/g,
      ''
    )
    if (!fileName) {
      fileName = 'content.pdf'
    }
  } catch {
    return { errorCodes: [UploadFileRequestErrorCode.BadInput] }
  }

  uploadFileData = await models.uploadFile.create({
    url: input.url,
    userId: claims.uid,
    fileName: fileName,
    status: UploadFileStatus.Initialized,
    contentType: input.contentType,
  })

  if (uploadFileData.id) {
    const uploadFilePathName = generateUploadFilePathName(
      uploadFileData.id,
      fileName
    )
    const uploadSignedUrl = await generateUploadSignedUrl(
      uploadFilePathName,
      input.contentType
    )
    return { id: uploadFileData.id, uploadSignedUrl }
  } else {
    return { errorCodes: [UploadFileRequestErrorCode.FailedCreate] }
  }
}
