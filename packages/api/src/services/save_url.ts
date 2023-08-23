import { ArticleSavingRequestStatus } from '../elastic/types'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import { SaveErrorCode, SaveResult, SaveUrlInput } from '../generated/graphql'
import { PubsubClient } from '../pubsub'
import { getRepository } from '../repository'
import { logger } from '../utils/logger'
import { createPageSaveRequest } from './create_page_save_request'
import { createLabels } from './labels'

interface SaveContext {
  pubsub: PubsubClient
  uid: string
}

export const saveUrl = async (
  ctx: SaveContext,
  user: User,
  input: SaveUrlInput
): Promise<SaveResult> => {
  try {
    // save state
    const archivedAt =
      input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
    // add labels to page
    const labels = input.labels
      ? await createLabels(ctx, input.labels)
      : undefined

    const pageSaveRequest = await createPageSaveRequest({
      ...input,
      userId: ctx.uid,
      pubsub: ctx.pubsub,
      articleSavingRequestId: input.clientRequestId,
      archivedAt,
      labels,
      user,
      locale: input.locale || undefined,
      timezone: input.timezone || undefined,
      savedAt: input.savedAt ? new Date(input.savedAt) : undefined,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
    })

    return {
      clientRequestId: pageSaveRequest.id,
      url: `${homePageURL()}/${user.profile.username}/links/${
        pageSaveRequest.id
      }`,
    }
  } catch (error) {
    logger.info('error enqueuing request', error)
    return {
      __typename: 'SaveError',
      errorCodes: [SaveErrorCode.Unknown],
    }
  }
}

export const saveUrlFromEmail = async (
  ctx: SaveContext,
  url: string,
  clientRequestId: string
): Promise<boolean> => {
  const user = await getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    return false
  }

  const result = await saveUrl(ctx, user, {
    url,
    clientRequestId,
    source: 'email',
  })
  if (result.__typename === 'SaveError') {
    return false
  }

  return true
}
