import { env } from '../../env'
import {
  MutationUploadFileRequestArgs,
  UploadFileRequestError,
  UploadFileRequestSuccess,
} from '../../generated/graphql'
import { uploadFile } from '../../services/upload_file'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
export const uploadFileRequestResolver = authorized<
  UploadFileRequestSuccess,
  UploadFileRequestError,
  MutationUploadFileRequestArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'file_upload_request',
    properties: {
      url: input.url,
      env: env.server.apiEnv,
    },
  })

  return uploadFile(input, uid)
})
