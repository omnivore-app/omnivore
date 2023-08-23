import { User } from '../../entity/user'
import { env } from '../../env'
import {
  MutationSaveFileArgs,
  MutationSavePageArgs,
  MutationSaveUrlArgs,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../repository'
import { saveFile } from '../../services/save_file'
import { savePage } from '../../services/save_page'
import { saveUrl } from '../../services/save_url'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

export const savePageResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSavePageArgs
>(async (_, { input }, ctx) => {
  analytics.track({
    userId: ctx.uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'page',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return savePage(ctx, user, input)
})

export const saveUrlResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveUrlArgs
>(async (_, { input }, ctx) => {
  const {
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

  const user = await getRepository(User).findOneBy({
    id: uid,
  })
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveUrl(ctx, user, input)
})

export const saveFileResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveFileArgs
>(async (_, { input }, ctx) => {
  analytics.track({
    userId: ctx.uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'file',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveFile(ctx, user, input)
})
