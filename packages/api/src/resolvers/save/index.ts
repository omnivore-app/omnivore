import { env } from '../../env'
import {
  MutationSaveFileArgs,
  MutationSavePageArgs,
  MutationSaveUrlArgs,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
} from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { saveFile } from '../../services/save_file'
import { savePage } from '../../services/save_page'
import { saveUrl } from '../../services/save_url'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

export const savePageResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSavePageArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'page',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return savePage(input, user)
})

export const saveUrlResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveUrlArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'url',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveUrl(input, user)
})

export const saveFileResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveFileArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'file',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveFile(input, user)
})
