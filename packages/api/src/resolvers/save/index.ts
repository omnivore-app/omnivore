import {
  MutationSaveFileArgs,
  MutationSavePageArgs,
  MutationSaveUrlArgs,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
} from '../../generated/graphql'
import { savePage } from '../../services/save_page'
import { saveUrl } from '../../services/save_url'
import { saveFile } from '../../services/save_file'
import { authorized, userDataToUser } from '../../utils/helpers'
import { createIntercomEvent } from '../../utils/intercom'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

export const savePageResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSavePageArgs
>(async (_, { input }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx
  analytics.track({
    userId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'page',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return savePage(
    { ...ctx, uid },
    { userId: user.id, username: user.profile.username },
    input
  )
})

export const saveUrlResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveUrlArgs
>(async (_, { input }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx

  analytics.track({
    userId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'url',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return (await saveUrl(ctx, user, input)) as SaveSuccess
})

export const saveFileResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveFileArgs
>(async (_, { input }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx

  analytics.track({
    userId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'file',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return (await saveFile({ ...ctx, uid }, user, input)) as SaveSuccess
})
