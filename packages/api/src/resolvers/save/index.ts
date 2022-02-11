import {
  MutationSaveUrlArgs,
  MutationSavePageArgs,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
  MutationSaveFileArgs,
} from '../../generated/graphql'
import { savePage } from '../../services/save_page'
import { saveUrl } from '../../services/save_url'
import { saveFile } from '../../services/save_file'
import { authorized, userDataToUser } from '../../utils/helpers'
import { createIntercomEvent } from '../../utils/intercom'

export const savePageResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSavePageArgs
>(async (_, { input }, ctx) => {
  const {
    models,
    claims: { uid },
  } = ctx
  createIntercomEvent('link-saved', uid)

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return await savePage(
    ctx,
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
  createIntercomEvent('link-saved', uid)

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
  createIntercomEvent('link-saved', uid)

  const user = userDataToUser(await models.user.get(uid))
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return (await saveFile(ctx, user, input)) as SaveSuccess
})
